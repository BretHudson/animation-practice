#version 300 es
precision highp float;

#include "@motion-canvas/core/shaders/common.glsl"

#define PI 3.14159
#define rot(at) mat2(cos(at), -sin(at), sin(at), cos(at))

uniform float axis;
uniform vec4 colorA;
uniform vec4 colorB;

// NOTE(bret): I grabbed this from one of my Shadertoys
float edge(in float d, in float a, in float b)
{
    return 1.0 - smoothstep(a, b, d);
}

float linearstep(float x, float y, float a)
{
	return (a - x) / (y - x);
}

void main()
{
	vec2 uv = sourceUV;
	
	uv *= 1. - uv.yx;
	
	float vig = uv.x * uv.y * 15.;
	vig = pow(vig, .25);
	
    outColor = mix(colorA, colorB, 1.-vig);
}
