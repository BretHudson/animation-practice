#version 300 es
precision highp float;

#include "@motion-canvas/core/shaders/common.glsl"

#define PI 3.14159
#define rot(at) mat2(cos(at), -sin(at), sin(at), cos(at))

uniform float axis;
uniform float index;
uniform float maxIndex;
uniform float dur;
uniform float zoom;

// NOTE(bret): I grabbed this from one of my Shadertoys
float edge(in float d, in float a, in float b)
{
    return 1.0 - smoothstep(a, b, d);
}

vec2 N22(vec2 p)
{
    vec3 a = fract(p.xyx * vec3(437.3821, 60184.4735, 3145.6534));
    a += dot(a, a + 34.45);
    return fract(vec2(a.x * a.y, a.y * a.z));
}

float vEdge(vec2 uv, vec2 a, vec2 b)
{
    vec2 halfway = (a + b) * .5;
    vec2 direction = normalize(a - b);
    return dot(uv - halfway, direction);
}

float smin2(float a, float b, float r)
{
    float f = max(0., 1. - abs(b - a) / r);
    return min(a, b) - r * .25 * f * f;
}

vec3 bgColor = vec3(55., 65., 183.) / 255.;

void main()
{
    int iAxis = int(axis);
    vec2 _resolution = (vec4(resolution, 0., 1.) * sourceMatrix).xy;
    vec2 uv = -(sourceUV * _resolution.xy * 2.0 - _resolution.xy) / _resolution[1 - iAxis];
	uv[iAxis] -= 7.3;
    
	uv *= zoom;
	
	float iTime = time * 2. * PI / dur;
    vec2 off = vec2((1. - axis) * 1., axis * 1.) * rot(-sin(iTime / 4.));
    uv += off;
    uv *= rot(cos(iTime / 4.) * .125);
    uv -= off;
    
    float t = iTime * .2;
    t = 8329.78 + sin(iTime) * .5;
    
    float minDist = 100.;
    float minDist2 = 100.;
    vec3 col = vec3(0);

    vec2 gv = fract(uv) - .5;
    vec2 id = floor(uv);

    vec2 cellId = vec2(0);
    vec2 A;
    for (float y = -1.; y <= 1.; ++y)
    {
        for (float x = -1.; x <= 1.; ++x)
        {
            vec2 off = vec2(x, y);
            vec2 _cellId = id + off;
            vec2 n = N22(_cellId);
            vec2 p = off + sin(n * t) * .5;

            float d = length(gv - p);
            if (d < minDist)
            {
                minDist = d;
                cellId = _cellId;
                A = p;
            }
        }
    }
    for (float y = -1.; y <= 1.; ++y)
    {
        for (float x = -1.; x <= 1.; ++x)
        {
            vec2 off = vec2(x, y);
            vec2 _cellId = id + off;
            vec2 n = N22(_cellId);
            vec2 p = off + sin(n * t) * .5;
            vec2 B = p;
            
            if (dot(A - B, A - B) < .001) continue;

            vec2 halfway = gv - .5 * (A + B);
            vec2 dir = normalize(A - B);
            float dist = dot(halfway, dir);
            minDist2 = smin2(minDist2, dist, .25);
        }
    }
    
    vec2 n = N22(N22(N22(cellId)));
    float _n = floor((n.x + n.y) / 2. * maxIndex);
	float a = 0.;
	if (abs(_n - index) < .01)
		a = 1.;
    
    minDist2 = smoothstep(-.2, .5, minDist2);
    minDist2 = 1. - minDist2;
    minDist2 = pow(minDist2, 8.);
    minDist2 = 1. - minDist2;
    
    
    col = texture(sourceTexture, sourceUV).rgb;
    col = mix(bgColor, col, minDist2);
    
    outColor = vec4(col, a * minDist2);//min(1., mix(0., 2., minDist2 * a * 2.)));
}