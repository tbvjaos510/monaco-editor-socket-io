require.config({
    paths: {
        'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.13.1/min/vs'
    }
})
window.MonacoEnvironment = {
    getWorkerUrl: function (workerId, label) {
        return `data:text/javascriptcharset=utf-8,${encodeURIComponent(`
        self.MonacoEnvironment = {
          baseUrl: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.13.1/min/vs'
        }
        importScripts('https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.13.1/min/vs/base/worker/workerMain.js')`
      )}`
    }
}

require(["vs/editor/editor.main"], function () {
    var htmlCode = `<!DOCTYPE HTML>
    <!-- 
        Comments are overrated
    -->
    <html>
    <head>
        <title>HTML Sample</title>
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <style type="text/css">
            h1 {
                color: #CCA3A3
            }
        </style>
        <script type="text/javascript">
            window.alert("I am a sample...")
        </script>
    </head>
    <body>
        <h1>Heading No.1</h1>
        <input disabled type="button" value="Click me" />
    </body>
    </html>`

    var editor = monaco.editor.create(document.getElementById("editor"), {
        value: htmlCode,
        language: "html",
        fontSize: 15,
        fontFamily: "Nanum Gothic Coding",
    })


    function insertWidget(e) {
        contentWidgets[e.name] = {
            domNode: null,
            position: {
                lineNumber: 0,
                column: 0
            },
            getId: function () {
                return 'content.' + e.name
            },
            getDomNode: function () {
                if (!this.domNode) {
                    this.domNode = document.createElement('div')
                    this.domNode.innerHTML = e.name
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


    function changeWidgetPosition(e) {
        contentWidgets[e.user].position.lineNumber = e.selection.endLineNumber
        contentWidgets[e.user].position.column = e.selection.endColumn

        editor.removeContentWidget(contentWidgets[e.user])
        editor.addContentWidget(contentWidgets[e.user])
    }

    function changeSeleciton(e) {
        var selectionArray = []
        if (e.selection.startColumn == e.selection.endColumn && e.selection.startLineNumber == e.selection.endLineNumber) {
            e.selection.endColumn++
            selectionArray.push({
                range: e.selection,
                options: {
                    className: `${e.ename}one`,
                    hoverMessage: {
                        value: e.user
                    }
                }
            })

        } else {
            selectionArray.push({
                range: e.selection,
                options: {
                    className: e.ename,
                    hoverMessage: {
                        value: e.user
                    }
                }
            })
        }
        for (let data of e.secondarySelections) {
            if (data.startColumn == data.endColumn && data.startLineNumber == data.endLineNumber) {
                selectionArray.push({
                    range: data,
                    options: {
                        className: `${e.ename}one`,
                        hoverMessage: {
                            value: e.user
                        }
                    }
                })
            } else
                selectionArray.push({
                    range: data,
                    options: {
                        className: e.ename,
                        hoverMessage: {
                            value: e.user
                        }
                    }
                })
        }
        decorations[e.user] = editor.deltaDecorations(decorations[e.user], selectionArray)
    }

    function changeText(e) {
        editor.getModel().applyEdits(e.changes)
    }

})