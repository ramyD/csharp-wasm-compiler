TOP=../../../../..

DOTNET=$(TOP)/dotnet.sh

DOTNET_Q_ARGS=--nologo -bl

CONFIG?=Release

WASM_DEFAULT_BUILD_ARGS?=/p:TargetArchitecture=wasm /p:TargetOS=Browser /p:Configuration=$(CONFIG)

ifneq ($(AOT),)
override MSBUILD_ARGS+=/p:RunAOTCompilation=true
endif

PROJECT_NAME=csb.csproj

# we set specific headers to enable SharedArrayBuffer support in browsers for threading: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer#security_requirements
CORS_HEADERS?= -h "Cross-Origin-Opener-Policy:same-origin" -h "Cross-Origin-Embedder-Policy:require-corp"

all: publish

run: run-browser

build:
	$(DOTNET) build $(DOTNET_Q_ARGS) $(WASM_DEFAULT_BUILD_ARGS) $(MSBUILD_ARGS) $(PROJECT_NAME)

publish:
	$(DOTNET) publish $(DOTNET_Q_ARGS) $(WASM_DEFAULT_BUILD_ARGS) -p:WasmBuildOnlyAfterPublish=true $(MSBUILD_ARGS) $(PROJECT_NAME)

clean:
	rm -rf bin $(TOP)/artifacts/obj/mono/$(PROJECT_NAME:%.csproj=%)

run-browser:
	if ! $(DOTNET) tool list --global | grep dotnet-serve && ! which dotnet-serve ; then \
		echo "The tool dotnet-serve could not be found. Install with: $(DOTNET) tool install --global dotnet-serve"; \
		exit 1; \
	else  \
		$(DOTNET) serve -d:bin/$(CONFIG)/AppBundle $(CORS_HEADERS) -o -p:8000; \
	fi
