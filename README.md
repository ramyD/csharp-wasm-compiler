# csharp-wasm-compiler
Compile and run csharp in your browser using dotnet 7 wasm target.

## Overview
This project is meant to be a feature demonstration page on how to use dotnet 7's wasm target to not only execute C# code in the browser but also use the Roslyn compiler to dynamically compile and execute user code from the webpage itself.

## Thank You
Big thank you to [@nbarkhina](https://github.com/nbarkhina) and their [CSharp-In-Browser](https://github.com/nbarkhina/CSharp-In-Browser) repo in showing this was possible. The differences between mono/dotnet 4.7 vs dotnet 7.0, and the project objectives meant that a fresh repo was better suited as opposed to fork. Having said that, a lot of the code is re-used here so I wanted to take the time and mention their contribution.

## Future work
I would like to create a csproj file that can be used with a binary install of the dotnet runtime but do not currently have the time to investigate creating the solution.

# Build
## Dotnet 7
Build dotnet 7 from source along with its wasm target

	sudo apt install -y cmake llvm lld clang build-essential \
	python-is-python3 curl git lldb libicu-dev liblttng-ust-dev \
	libssl-dev libnuma-dev libkrb5-dev zlib1g-dev ninja-build

	git clone --depth 1 -b v7.0.2 --recursive https://github.com/dotnet/runtime.git
	cd runtime

	make -C src/mono/wasm provision-wasm
	export EMSDK_PATH=`pwd`/src/mono/wasm/emsdk
	./build.sh -os browser -configuration Release
	export DOTNET_ROOT=`pwd`/.dotnet
	export PATH=$PATH:`pwd`.dotnet:`pwd`.dotnet/tools

If you will want to use the dotnet webserver, now is a good time to install it

	./dotnet.sh tool install --global dotnet-serve
	export PATH="$PATH:$HOME/.dotnet/tools"

## CSharp WASM Compiler
You can clone this project in the sample folder of the dotnet runtime repo here

	cd src/mono/sample/wasm

clone the project and make

	git clone --depth 1 https://github.com/ramyD/csharp-wasm-compiler.git
	cd csharp-wasm
	make

from here you can simply start a simple http server in the *bin/Release/Appbundle/* directory or run

	make run
	
to use the dotnet webserver tool
