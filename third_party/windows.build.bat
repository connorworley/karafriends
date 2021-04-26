docker build -t karafriends-third_party-windows -f windows.Dockerfile .
docker run -v %CD%:/code -v %CD%\..\prebuilt\windows:/out karafriends-third_party-windows /code/windows.build.sh
