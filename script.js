import createDotnetRuntime, { dotnet, exit } from './dotnet.js'

var displayConsole = false;

function sayHelloCallback(message){
	//console.log("message: " + message);
	document.getElementById("fromauto").innerText = message;
}

function setCompileLog (log){
	//console.log('compile log', log);
	if (log.includes('Compilation success'))
		log = "<span style='background-color:lightgreen'>&nbsp;Success&nbsp;</span><br>" + log;
	else
		log = "<span style='background-color:red'>&nbsp;Error&nbsp;</span><br>" + log;

	document.getElementById("fromcompileoutput_compiler").innerHTML = log;
	displayConsole = false;
}

function setRunLog (log){
	//console.log('run log', log);
	document.getElementById("fromcompileoutput_runtime").innerHTML = log;
}

function consumeConsoleWriteline (log) {
	console.log(log);
	if (displayConsole) document.getElementById("fromcompileoutput_results").innerHTML = log;
}

function consumeConsoleError (log) {
	console.warn(log);
	if (displayConsole) document.getElementById("fromcompileoutput_errors").innerHTML = log;
}

//try {
    const { runtimeBuildInfo, setModuleImports, getAssemblyExports, runMain, getConfig } = await dotnet
        //.withConsoleForwarding() // executes a websocket connection to /console
        .withElementOnExit()
        .withModuleConfig({
            configSrc: "./mono-config.json",
            onConfigLoaded: (config) => {
                // This is called during emscripten `dotnet.wasm` instantiation, after we fetched config.
                console.log('user code Module.onConfigLoaded');
		config.debugLevel = 0;
                // config is loaded and could be tweaked before the rest of the runtime startup sequence
                //config.environmentVariables["MONO_LOG_LEVEL"] = "debug"
                config.environmentVariables["MONO_LOG_LEVEL"] = "info"
            },
            preInit: () => { console.log('user code Module.preInit'); },
            preRun: () => { console.log('user code Module.preRun'); },
            onRuntimeInitialized: () => {
                console.log('user code Module.onRuntimeInitialized');
                // here we could use API passed into this callback
                // Module.FS.chdir("/");
            },
            onDotnetReady: () => {
                // This is called after all assets are loaded.
                console.log('user code Module.onDotnetReady');
            },
            postRun: () => { console.log('user code Module.postRun'); },
            print: consumeConsoleWriteline,
            printErr: consumeConsoleError,
	
        })
        .create();


    // at this point both emscripten and monoVM are fully initialized.
    // we could use the APIs returned and resolved from createDotnetRuntime promise
    // both exports are receiving the same object instances
	console.log('user code after createDotnetRuntime()');
	setModuleImports("script.js", {
		WasmRoslyn: {
		    Program: {
			sayHelloCallback,
			window: () => globalThis.window,
			location: () => globalThis.window.location,
			setCompileLog,
			setRunLog
		    }
		}
	});

	const config = getConfig();
	var exports = await getAssemblyExports(config.mainAssemblyName);
	exports.WasmRoslyn.Program.SayHello();

	let exit_code = await runMain(config.mainAssemblyName, []);
	//exit(exit_code);

	document.getElementById("execute").addEventListener('click', (event) => {
		const msg = exports.WasmRoslyn.Program.ExecuteOnDemand();
		document.getElementById("frombutton").innerText = msg;
	});

	document.getElementById("compileandrun").addEventListener('click', (event) => {
		displayConsole = true;
		setRunLog("");
		consumeConsoleWriteline("");
		consumeConsoleError("");
		exports.WasmRoslyn.Program.Run(document.getElementById("code").value);
	});

//}
//catch (err) {
//    exit(2, err);
//}
//
