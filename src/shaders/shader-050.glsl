#version 300 es
precision highp float;

#include "@motion-canvas/core/shaders/common.glsl"

#define PI 3.14159
#define rot(at) mat2(cos(at), -sin(at), sin(at), cos(at))

uniform float axis;
uniform float sinAmp;
uniform float sinAmpScale;
uniform float sawAmp;
uniform float sawAmpScale;
uniform float period;
uniform float zoom;

// NOTE(bret): I grabbed this from one of my Shadertoys
float edge(in float d, in float a, in float b)
{
    return 1.0 - smoothstep(a, b, d);
}

void main()
{
	vec2 uv = sourceUV;
	uv *= zoom;
	uv.x -= .5;
	uv.x /= period;
	uv.x = uv.x + time * .25;
	uv.y += sin(time / 16. * PI * 2.) * .04;
	float sinOffset = (cos(uv.x * PI * 2. + PI) + .5) * sinAmp * sinAmpScale * .5;
	float tp = uv.x / 1.;
	float sawOffset = 2. * abs(tp - floor(tp + .5)) * sawAmp * sawAmpScale;
	//abs(1. - mod(uv.x, 2.)) * sawAmp;
	
	float offset = sinOffset + sawOffset;
	
	vec2 vOffset = vec2(0., offset);
	vec2 v = vec2(sourceUV.x, uv.y) + vOffset;
	v = mod(v, vec2(1.));
    outColor = texture(sourceTexture, v);
}
