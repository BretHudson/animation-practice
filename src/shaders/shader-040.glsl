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
uniform vec4 bgColor;

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
	p /= .5;
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


float sdRoundedCross( in vec2 p, in float h )
{
    float k = 0.5*(h+1.0/h);
    p = abs(p);
    return ( p.x<1.0 && p.y<p.x*(k-h)+h ) ? 
             k-sqrt(dot2(p-vec2(1,k)))  :
           sqrt(min(dot2(p-vec2(0,h)),
                    dot2(p-vec2(1,0))));
}

// NOTE(bret): kudos to https://github.com/glslify/glsl-easings
float backInOut(float t)
{
  float f = t < 0.5
    ? 2.0 * t
    : 1.0 - (2.0 * t - 1.0);

  float g = pow(f, 3.0) - f * sin(f * PI);

  return t < 0.5
    ? 0.5 * g
    : 0.5 * (1.0 - g) + 0.5;
}

// NOTE(bret): I grabbed this from one of my Shadertoys
float edge(in float d, in float a, in float b)
{
    return 1.0 - smoothstep(a, b, d);
}

float smin(float a, float b, float k)
{
    float h = max(k - abs(a - b), 0.) / k;
    return min(a, b) - h * h * h * k * (1. / 6.);
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
		abs(sdRoundedX(uv, size)) - .03
        ,
		abs(sdCircle(uv, size)) - .03
        ,
		abs(sdHexagram(uv, size * .3)) - .03
        ,
		abs(sdRoundedCross(uv, .8)) - .03
	);
	
	
	int shape1 = int(mod(floor(shape), 4.));
	int shape2 = int(mod(float(shape1) + 1., 4.));
	int shape3 = int(mod(float(shape2) + 1., 4.));
    float t = backInOut(fract(shape));
    float d1 = d[shape1];
    float d2 = d[shape2];
    float d3 = d[shape3];
	float s1 = smin(d1, d2, 1.);
	float s2 = smin(d2, d3, 1.);
    float _d = mix(s1, s2, t);
	
	_d = edge(_d, 0., 0.02);
	
	vec3 bg = vec3(230., 222., 227.) / 255.;
    //vec3 col = vec3(1., .5, .3) * .9;
    vec3 col = bgColor.rgb;
    outColor = vec4(mix(bg, col, 1. - _d), 1.);
}