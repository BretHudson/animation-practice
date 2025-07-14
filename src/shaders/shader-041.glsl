#version 300 es
precision highp float;

#include "@motion-canvas/core/shaders/common.glsl"

#define PI 3.14159
#define rot(at) mat2(cos(at), -sin(at), sin(at), cos(at))

uniform float holeSize;
uniform vec4 bgColor;

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
	uv *= 10.;
	
	vec4 source = texture(sourceTexture, sourceUV);
	
    outColor = vec4(1., 0., 0., source.a);
	
	
	vec2 _uv = fract(uv) * 2. - 1.;
	float r = hash(floor(uv)) * .14;
	float xx = hash(r * vec2(12.7349, -84.87));
	float yy = hash(r * vec2(49.85421, 549.897));
	_uv += vec2(xx, yy) * .3;
	float _holeSize = holeSize * 1.3;
	float d = edge(length(_uv) - (.27 - r) * _holeSize, .2 * _holeSize, .0);
	
	uv = floor(uv);
	
	vec4 empty = bgColor;
	vec4 filled = source;
	vec4 finalColor = mix(empty, filled, d);
	
	outColor = vec4(finalColor.rgb, source.a);
}