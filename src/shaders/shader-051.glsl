#version 300 es
precision highp float;

#include "@motion-canvas/core/shaders/common.glsl"

#define PI 3.14159
#define rot(at) mat2(cos(at), -sin(at), sin(at), cos(at))

uniform float axis;
uniform float curvePercent;
uniform float ratio;

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
	
	float curve = sin(uv.x * PI);
	float top = mix(0., .5 - curve, curvePercent * ratio);
	float bot = mix(1., 1.5 - curve, curvePercent * ratio);
	
	uv.y = linearstep(top, bot, uv.y);
	
    outColor = texture(sourceTexture, uv);
}
