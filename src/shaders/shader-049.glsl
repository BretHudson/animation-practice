#version 300 es
precision highp float;

#include "@motion-canvas/core/shaders/common.glsl"

#define PI 3.14159
#define rot(at) mat2(cos(at), -sin(at), sin(at), cos(at))

uniform float axis;

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


float sdSine( in vec2 p, in float amp ) 
{
    return amp * (sin(p.x) + 1.) / 2. - p.y;
}

float sdSine( in vec2 p ) 
{
    return sdSine(p, 1.);
}

vec4 color( vec2 uv )
{
	uv.y = (4. * abs(uv.y) - 3.5) * .5;
	uv.x += time * .5;
	
	//float s = sin((uv.x + time) * .5) - 1.;
	float amp = mix(.3, .5, (sin(uv.x / 3. + time * 1.5) + 1.) / 2.);
	//amp = 1.;
	float _d = 1.-sdSine(uv, amp);
	float d = edge(-_d, 0., 1.);
	float mask = edge(_d, 0., .02);
	
	float a = ((0.-_d)-0.) * d;
	
	vec3 b = vec3(240., 123., 20.) / 255.;
	vec3 c = vec3(214., 187., 154.) / 255.;
	
	return mix(vec4(b, 0.), vec4(c, .9), d * d * mask) * .5;
}

void main()
{
	vec2 _resolution = (vec4(resolution, 0., 1.) * sourceMatrix).xy;
    vec2 uv = (sourceUV * _resolution.xy * 2.0 - _resolution.xy) / _resolution[1 - int(axis)];
	//vec4 source = texture(sourceTexture, sourceUV);
	
	outColor = color(uv * vec2(3. / 4., 1.) + vec2(5. + time * (1. / 3.), 0.)) + color(uv * vec2(1., .9));
}
