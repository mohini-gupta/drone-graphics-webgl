#version 300 es
precision highp float;

in vec3 fs_pos;
in vec3 fs_norm;
in vec2 fs_uv;

uniform sampler2D u_texture;
uniform vec3 lightDir;
uniform vec4 lightColor;

uniform vec4 mDiffColor;
uniform vec4 mSpecColor;
uniform float mSpecPower;

uniform mat4 lightDirMatrix;
uniform mat4 lightPosMatrix;

out vec4 color;

void main() {
	vec3 nEyeDirection = normalize(-fs_pos); 
	
	vec3 nLightDir = -normalize (lightDir); 
	vec4 lDir = lightDirMatrix*vec4(lightDir,1.0);
	
	vec3 nNormal = normalize(fs_norm); 
	
	vec4 diffuse = lightColor * mDiffColor * clamp(dot(lDir,vec4(nNormal,0.0)),0.0,1.0); 	
	
	vec3 reflection = -reflect(nLightDir, nNormal);
	vec4 specular = lightColor * pow(clamp(dot(reflection, nEyeDirection), 0.0, 1.0), mSpecPower) * mSpecColor;
		
    vec4 texcol = texture(u_texture, fs_uv);	
		
	color = min( texcol+diffuse + specular, vec4(1.0, 1.0, 1.0, 1.0));
}