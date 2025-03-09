cmake_minimum_required(VERSION 3.10)
project(SimpleUPnPServer)

find_package(PkgConfig REQUIRED)
pkg_check_modules(LIBUPNP REQUIRED libupnp)

find_package(yaml-cpp REQUIRED)

add_executable(upnp_server main.cpp)
target_include_directories(upnp_server PRIVATE ${LIBUPNP_INCLUDE_DIRS})
target_link_libraries(upnp_server PRIVATE ${LIBUPNP_LIBRARIES} yaml-cpp)