#version 300 es
precision highp float;

#include "@motion-canvas/core/shaders/common.glsl"

#define PI 3.14159
#define rot(at) mat2(cos(at), -sin(at), sin(at), cos(at))

uniform float opacity;
uniform float axis;
uniform float size;
uniform float rotation;
uniform float shape;

// NOTE(bret): Kudos to IQ!! https://iquilezles.org/articles/distfunctions2d/
float sdCircle( vec2 p, float r )
{
    return length(p) - r;
}

float sdRoundedX( in vec2 p, in float w, in float r )
{
    p = abs(p);
    return length(p-min(p.x+p.y,w)*0.5) - r;
}

float sdRoundedX( in vec2 p, in float w )
{
	return sdRoundedX(p, w, w / 5.);
}

float sdHexagram( in vec2 p, in float r )
{
    const vec4 k = vec4(-0.5,0.8660254038,0.5773502692,1.7320508076);
    p = abs(p);
    p -= 2.0*min(dot(k.xy,p),0.0)*k.xy;
    p -= 2.0*min(dot(k.yx,p),0.0)*k.yx;
    p -= vec2(clamp(p.x,r*k.z,r*k.w),r);
    return length(p)*sign(p.y);
}

float sdEquilateralTriangle( in vec2 p, in float r )
{
    const float k = sqrt(3.0);
    p.x = abs(p.x) - r;
    p.y = p.y + r/k;
    if( p.x+k*p.y>0.0 ) p = vec2(p.x-k*p.y,-k*p.x-p.y)/2.0;
    p.x -= clamp( p.x, -2.0*r, 0.0 );
    return -length(p)*sign(p.y);
}

float dot2( vec2 v ) { return dot(v,v); }
float sdfCoolS( in vec2 p )
{
	p /= .8;
    float six = (p.y<0.0) ? -p.x : p.x;
    p.x = abs(p.x);
    p.y = abs(p.y) - 0.2;
    float rex = p.x - min(round(p.x/0.4),0.4);
    float aby = abs(p.y-0.2)-0.6;
    
    float d = dot2(vec2(six,-p.y)-clamp(0.5*(six-p.y),0.0,0.2));
    d = min(d,dot2(vec2(p.x,-aby)-clamp(0.5*(p.x-aby),0.0,0.4)));
    d = min(d,dot2(vec2(rex,p.y  -clamp(p.y          ,0.0,0.4))));
    
    float s = 2.0*p.x + aby + abs(aby+0.4) - 0.4;
    return sqrt(d) * sign(s);
}

float edge(in float d, in float a, in float b)
{
    return 1.0 - smoothstep(a, b, d);
}

void main()
{
	int axisId = int(axis);
	
	// Normalized pixel coordinates (from 0 to 1)
    vec2 uv = (sourceUV * resolution.xy * 2.0 - resolution.xy) / resolution[1 - axisId];
	
	uv *= rot(-rotation * PI / 180.);
	
    //uv.y *= -1.0;
	uv *= 1.5;
	//uv[axisId] = fract(uv[axisId] + .5) - .5;
    
		
	vec4 d = vec4(
		sdHexagram(uv, size * .5),
		sdfCoolS(uv),
		sdRoundedX(uv, size),
		sdCircle(uv, size)
	);
	
	
	int shape1 = int(mod(floor(shape), 4.));
	int shape2 = int(mod(ceil(shape), 4.));
	float _d = mix(d[shape1], d[shape2], fract(shape));
	
	_d = edge(_d, 0., 0.02);
	
	vec3 bg = vec3(230., 222., 227.) / 255.;
    vec3 col = vec3(1., .5, .3) * .9;
    outColor = vec4(mix(bg, col, 1. - _d), 1.);
}