#version 300 es
#define POSITION_LOCATION 0
#define NORMAL_LOCATION 1
#define UV_LOCATION 2

in vec3 in_pos;
in vec3 in_norm;
in vec2 in_uv;

uniform mat4 nMatrix;
uniform mat4 wvpMatrix;

out vec3 fs_pos;
out vec3 fs_norm;
out vec2 fs_uv;

void main() {
	
	fs_pos =( wvpMatrix * vec4(in_pos,1.0)).xyz ;
	fs_norm = (nMatrix * vec4(in_norm, 0.0)).xyz;
	fs_uv = in_uv;	
	
	gl_Position = (wvpMatrix * vec4(in_pos, 1.0));
}
