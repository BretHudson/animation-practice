#version 300 es
precision highp float;

#include "@motion-canvas/core/shaders/common.glsl"

#define PI 3.14159
#define rot(at) mat2(cos(at), -sin(at), sin(at), cos(at))

uniform float iTime;
uniform float opacity;
uniform float axis;
uniform float t;

float sdRoundedX( in vec2 p, in float w, in float r )
{
    p = abs(p);
    return length(p-min(p.x+p.y,w)*0.5) - r;
}

float sdRoundedX( in vec2 p, in float w )
{
	return sdRoundedX(p, w, w / 5.);
}

float edge(in float d, in float a, in float b)
{
    return 1.0 - smoothstep(a, b, d);
}

void main()
{
    float _time = time - iTime;
    
	int axisId = int(axis);
	
	// Normalized pixel coordinates (from 0 to 1)
    vec2 uv = (sourceUV * resolution.xy * 2.0 - resolution.xy) / resolution[1 - axisId];
    //uv.y *= -1.0;
	uv *= 1.5;
	uv[axisId] -= t;
	float slot = floor(mod(uv[axisId] + .5, 2.));
	float fuck = floor(mod(uv[axisId] + .5, 4.) / 2.);
	uv[axisId] = mod(uv[axisId] + .5, 1.) - .5;
    
	
	float ee = (cos((t + .1) * PI) + 1.) / 2.;
	float alt = slot - cos(t / 2. * PI);
	float sign = (fuck * 2.) - 1.;
	vec2 offset = vec2(.3 * slot * sign);
	offset[axisId] = 0.;
	uv += offset;
	
	float _slot = mix(slot, 1. - slot, ee);
	uv = uv * rot((_slot - t) * PI / 4.);
	
	float d = sdRoundedX(uv, .5 - .2 * slot);
	//d = min(d, s2);
	
	float size = .3;
	float edgeR = 0.;
    d = edge(d, edgeR, edgeR + 0.2 * (size / 3.0));
    
	vec3 bg = vec3(238., 222., 222.) / 255.;
    vec3 col = vec3(1., .5, .3) * opacity;
    outColor = vec4(mix(bg, col, d), 1.);
}