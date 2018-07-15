var editor  //monaco editor - 에디터
var issocket = false // Avoid conflict between editor change event and socket change event - 에디터 변경 이번트와 소켓 변경 이벤트의 충돌을 방지
var isadmin = false // Administrator - 관리자 여부 
var users = {}  //user
var contentWidgets = {} //save monaco editor name contentWidgets - monaco editor의 이름 뜨는 위젯을 저장 
var decorations = {}    //save monaco editor cursor or selection decorations - monaco editor의 커서나 선택된 구역의 데코레이션을 저장
/* monaco editor with cdn */
require.config({
    paths: {
        'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.13.1/min/vs'
    }
})
window.MonacoEnvironment = {
    getWorkerUrl: function (workerId, label) {
        return `data:text/javascriptcharset=utf-8,${encodeURIComponent(`
        self.MonacoEnvironment = {
          baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.13.1/min'
        }
        importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.13.1/min/vs/base/worker/workerMain.js')`
      )}`
    }
}
/* end */
/**
 * @typedef User
 * @property {String} user usernamee - 사용자 이름
 * @property {String} color css colorcode - css색 코드
 */


/**
 * add CSS for other user
 * @param {String} id User ID
 * @param {String} color Color Code (#FFFFFF, red, etc)
 */
function insertCSS(id, color) {
    var style = document.createElement('style')
    style.type = 'text/css'
    style.innerHTML += '.' + id + ' { background-color:' + color + '}\n' //Selection Design
    style.innerHTML += `
    .${id}one { 
        background: ${color};
        width:2px !important 
    }`  //cursor Design
    document.getElementsByTagName('head')[0].appendChild(style)
}
/**
 * add Widget to new user (display name) - 새로운 사용자를 위한 위젯을 추가한다 (이름을 출력하는 곳) 
 * @param {User} e user
 */
function insertWidget(e) {
    contentWidgets[e.user] = {
        domNode: null,
        position: {
            lineNumber: 0,
            column: 0
        },
        getId: function () {
            return 'content.' + e.user
        },
        getDomNode: function () {
            if (!this.domNode) {
                this.domNode = document.createElement('div')
                this.domNode.innerHTML = e.user
                this.domNode.style.background = e.color
                this.domNode.style.color = 'black'
                this.domNode.style.opacity = 0.8
                this.domNode.style.width = 'max-content'
            }
            return this.domNode
        },
        getPosition: function () {
            return {
                position: this.position,
                preference: [monaco.editor.ContentWidgetPositionPreference.ABOVE, monaco.editor.ContentWidgetPositionPreference.BELOW]
            }
        }
    }
}
/**
 * change Widget Position - 위젯의 x, y를 통해 위치를 바꾼다.
 * @param {User} e user
 */
function changeWidgetPosition(e) {
    contentWidgets[e.user].position.lineNumber = e.selection.endLineNumber
    contentWidgets[e.user].position.column = e.selection.endColumn

    editor.removeContentWidget(contentWidgets[e.user])
    editor.addContentWidget(contentWidgets[e.user])
}
/**
 * change Selection Cursor - 선택된 곳을 바꾼다.
 * @param {monaco.editor.ICursorSelectionChangedEvent} e Cursor Selection Event, (Add User) - 커서 선택 이벤트 (User객체의 데이터도 추가됨)
 */
function changeSeleciton(e) {
    var selectionArray = []
    if (e.selection.startColumn == e.selection.endColumn && e.selection.startLineNumber == e.selection.endLineNumber) { //if cursor - 커서일 때
        e.selection.endColumn++
        selectionArray.push({
            range: e.selection,
            options: {
                className: `${e.user}one`,
                hoverMessage: {
                    value: e.user
                }
            }
        })

    } else {    //if selection - 여러개를 선택했을 때
        selectionArray.push({   
            range: e.selection,
            options: {
                className: e.user,
                hoverMessage: {
                    value: e.user
                }
            }
        })
    }
    for (let data of e.secondarySelections) {       //if select multi - 여러개를 선택했을 때
        if (data.startColumn == data.endColumn && data.startLineNumber == data.endLineNumber) {
            selectionArray.push({
                range: data,
                options: {
                    className: `${e.user}one`,
                    hoverMessage: {
                        value: e.user
                    }
                }
            })
        } else
            selectionArray.push({
                range: data,
                options: {
                    className: e.user,
                    hoverMessage: {
                        value: e.user
                    }
                }
            })
    }
    decorations[e.user] = editor.deltaDecorations(decorations[e.user], selectionArray)  //apply change - 변경내용을 적용시킴
}
/**
 * 
 * @param {monaco.editor.IModelContentChangedEvent} e monaco ContentChange Event
 */
function changeText(e) {
    editor.getModel().applyEdits(e.changes) //change Content
}
require(["vs/editor/editor.main"], function () {
    var htmlCode = `function hello(){
        console.log('Hello World')
    }
    
    function Change(){
        document.getElementById("child").innerText = "Do"
    }
}`    //example Code

    editor = monaco.editor.create(document.getElementById("editor"), {
        value: htmlCode,
        language: "javascript",
        fontSize: 15,
        readOnly: true,
        fontFamily: "Nanum Gothic Coding",  //Set Font
    })
    //Monaco Event
    editor.onDidChangeModelContent(function (e) { //Text Change
        if (issocket == false) {
            socket.emit('key', e)
        } else
            issocket = false
    })
    editor.onDidChangeCursorSelection(function (e) {    //Cursor or Selection Change
        socket.emit('selection', e)
    })

    //Connect Socket
    var socket = io('/main')    //connect Namespace(/name)

    socket.on('connected', function (data) { //Connect New Client Event
        users[data.user] = data.color
        insertCSS(data.user, data.color)
        insertWidget(data)
        decorations[data.user] = []
        if (isadmin === true) {
            editor.updateOptions({readOnly: false})
            socket.emit("filedata", editor.getValue())
        }
    })
    socket.on('userdata', function (data) {     //Connected Client Status Event
        if (data.length == 1)
        isadmin = true
        for (var i of data) {
            users[i.user] = i.color
            insertCSS(i.user, i.color)
            insertWidget(i)
            decorations[i.user] = []
        }
    })
    socket.on('resetdata', function (data) {    //get Default Editor Value
        issocket = true
        editor.setValue(data)
        editor.updateOptions({readOnly: false})
        issocket = false
    })
    socket.on('admin', function (data) {    //admin Event  
        isadmin = true
        editor.updateOptions({readOnly: false})
    })
    socket.on('selection', function (data) {    //change Selection Event
        changeSeleciton(data)
        changeWidgetPosition(data)
    })
    socket.on('exit', function (data) { //Other User Exit Event
        editor.removeContentWidget(contentWidgets[data])
        editor.deltaDecorations(decorations[data], [])
        delete decorations[data]
        delete contentWidgets[data]
    })
    
    socket.on('key', function (data) {  //Change Content Event
        issocket = true
        changeText(data)
    })
  
})