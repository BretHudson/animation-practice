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

float sdStar(in vec2 p, in float r, in float n, in float w)
{
    // these 5 lines can be precomputed for a given shape
    //float m = n*(1.0-w) + w*2.0;
    float m = n + w*(2.0-n);
    
    float an = 3.1415927/n;
    float en = 3.1415927/m;
    vec2  racs = r*vec2(cos(an),sin(an));
    vec2   ecs =   vec2(cos(en),sin(en)); // ecs=vec2(0,1) and simplify, for regular polygon,

    // symmetry (optional)
    p.x = abs(p.x);
    
    // reduce to first sector
    float bn = mod(atan(p.x,p.y),2.0*an) - an;
    p = length(p)*vec2(cos(bn),abs(sin(bn)));

    // line sdf
    p -= racs;
    p += ecs*clamp( -dot(p,ecs), 0.0, racs.y/ecs.y);
    return length(p)*sign(p.x);
}

float sdCircle( vec2 p, float r )
{
    return length(p) - r;
}

float smin(float a, float b, float k)
{
    float h = max(k - abs(a - b), 0.) / k;
    return min(a, b) - h * h * h * k * (1. / 6.);
}

void main()
{
	vec2 _resolution = (vec4(resolution, 0., 1.) * sourceMatrix).xy;
    vec2 uv = (sourceUV * _resolution.xy * 2.0 - _resolution.xy) / _resolution.y;
	float dStar1 = sdStar(uv, .8, 12., .7);// - .03;
	float dStar2 = sdStar(uv, .7, 12., .9);
	//float d = smin(dStar1, dStar2, 0.5);
	float d = min(dStar1, dStar2) - .01;
	
	vec3 color = vec3(216., 20., 26.) / 255.;
	outColor = vec4(color, edge(d, 0., .001));
	
	vec2 dotUv = uv * 24.;
	dotUv *= rot(PI * .25);
	dotUv = fract(dotUv) - .5;
	float radius = sdCircle(uv * .75, .5);
	float d2 = sdCircle(dotUv, -radius);
	vec4 overlay = vec4(1, 1, 1, 0) * (1.-edge(d2, .02, .0));
	outColor = outColor - overlay;
}
