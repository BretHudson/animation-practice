#version 300 es
precision highp float;

#include "@motion-canvas/core/shaders/common.glsl"

#define PI 3.14159
#define rot(at) mat2(cos(at), -sin(at), sin(at), cos(at))

uniform float axis;

uniform vec3 borderColor;
uniform float thickness;
uniform float threshold;

// NOTE(bret): I grabbed this from one of my Shadertoys
float edge(in float d, in float a, in float b)
{
    return 1.0 - smoothstep(a, b, d);
}

vec2 N22(vec2 p)
{
    vec3 a = fract(p.xyx * vec3(123.34, 234.34, 345.65));
    a += dot(a, a + 34.45);
    return fract(vec2(a.x * a.y, a.y * a.z));
}

void main()
{
    vec2 _resolution = (vec4(resolution, 0., 1.) * sourceMatrix).xy;
    vec2 uv = -(sourceUV * _resolution.xy * 2.0 - _resolution.xy) / _resolution.y;
	
	vec4 pixel = texture(sourceTexture, sourceUV);
	
	if (pixel.a <= threshold)
	{
		ivec2 size = textureSize(sourceTexture, 0);
		
		float uv_x = sourceUV.x * float(size.x);
		float uv_y = sourceUV.y * float(size.y);
		
		float sum = 0.;
		for (int n = 0; n < 9; ++n) {
			uv_y = (sourceUV.y * float(size.y)) + thickness * (float(n) - 4.5);
			
			float h_sum = 0.;
			h_sum += texelFetch(sourceTexture, ivec2(uv_x - (4. * thickness), uv_y), 0).a;
			h_sum += texelFetch(sourceTexture, ivec2(uv_x - (3. * thickness), uv_y), 0).a;
			h_sum += texelFetch(sourceTexture, ivec2(uv_x - (2. * thickness), uv_y), 0).a;
			h_sum += texelFetch(sourceTexture, ivec2(uv_x - (1. * thickness), uv_y), 0).a;
			h_sum += texelFetch(sourceTexture, ivec2(uv_x, uv_y), 0).a;
			h_sum += texelFetch(sourceTexture, ivec2(uv_x + (1. * thickness), uv_y), 0).a;
			h_sum += texelFetch(sourceTexture, ivec2(uv_x + (2. * thickness), uv_y), 0).a;
			h_sum += texelFetch(sourceTexture, ivec2(uv_x + (3. * thickness), uv_y), 0).a;
			h_sum += texelFetch(sourceTexture, ivec2(uv_x + (4. * thickness), uv_y), 0).a;
			sum += h_sum / 9.;
		}
		
		if (sum / 9.0 >= 0.0001) {
			pixel = vec4(borderColor, .5);
		}
	}
	
	outColor = pixel;
	return;
	
	vec4 col = vec4(0);
	col = texture(sourceTexture, sourceUV);
	if (col.a < .01)
	{
		col.rgb = vec3(.5);
		col.a = 1.;
	}
    outColor = col;
}