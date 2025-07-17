#version 300 es
precision highp float;

#include "@motion-canvas/core/shaders/common.glsl"

#define PI 3.14159
#define rot(at) mat2(cos(at), -sin(at), sin(at), cos(at))

uniform float holeSize;
uniform vec4 bgColor;
uniform vec4 txtColor;
uniform vec4 shadowColor;

uniform float buffer;
uniform float gamma;

// NOTE(bret): I grabbed this from one of my Shadertoys
float edge(in float d, in float a, in float b)
{
    return 1.0 - smoothstep(a, b, d);
}

float hash(vec2 p)
{
    p = fract(p * vec2(123.345, 734.6897));
    p += dot(p, p + 47.32);
    return fract(p.x * p.y);
}

void main()
{
	vec2 _resolution = (vec4(resolution, 0., 1.) * sourceMatrix).xy;
    vec2 uv = (sourceUV * _resolution.xy * 2.0 - _resolution.xy) / _resolution.y;
	//uv *= 10.;
	
	
	vec4 source = texture(sourceTexture, sourceUV);
	float dist = source.r;
	float alpha = (smoothstep(buffer - gamma, buffer + gamma, dist) - .5) * 2.;
	
	outColor = vec4(1., 1., 1., alpha);
	outColor = vec4(bgColor.rgb, alpha);
	
	if (alpha > .9) {
		float a = min(10. * (alpha - .9), 1.);
		outColor = mix(outColor, vec4(shadowColor.rgb, alpha * shadowColor.a), a);
	}
	//if (alpha > .9999)
		//outColor = vec4(shadowColor.rgb, alpha);
}
