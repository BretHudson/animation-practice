#version 300 es
precision highp float;

#include "@motion-canvas/core/shaders/common.glsl"

#define PI 3.14159
#define rot(at) mat2(cos(at), -sin(at), sin(at), cos(at))

uniform float axis;
uniform float samples;
uniform vec2 velocity;

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
	
	vec4 color = texture(sourceTexture, uv);
	
	if (true)
	{
		uv += velocity;
		for (int i = 1; i < int(samples); ++i, uv += velocity)
		{
			color += texture(sourceTexture, uv);
		}
		
		color /= samples;
	}
	
    outColor = color;
}
