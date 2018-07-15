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
})