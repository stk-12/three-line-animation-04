attribute float aIndex;
attribute vec3 instancePosition;
attribute vec3 instanceScale;
attribute vec4 instanceRotation;
varying vec2 vUv;
uniform float uTime;
uniform float uDelay;
uniform float uWave;

// #pragma glslify: pnoise = require(glsl-noise/periodic/3d);

vec3 applyQuaternionToVector(vec4 q, vec3 v) {
    return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
}

void main() {
  vUv = uv;
  vec3 pos = position;

  // float distortion = pnoise((normal + uTime * 0.5), vec3(20.0) * 1.5) * uWave;
  // pos = pos + (normal + distortion);

  // ノイズを使用して頂点を変形
  // float noise = pnoise(vec3(pos.xy * 10.0, uTime * 0.5), vec3(10.0));
  // pos.z += noise * uWave;

  // 外側に向かって波を生成
  // float wave = sin(pos.x * 10.0 + uTime * 2.0) * 0.5;
  // pos.xy += normalize(pos.xy) * wave * uWave;

  // 外側に向かって滑らかな波を生成
  // float wave = sin(uv.y * 10.0 + uTime * 2.0) * 0.5;
  // pos.xy += normalize(pos.xy) * wave * uWave;

  // 各インスタンスのindexを使用して遅延を適用
  float delay = aIndex * uDelay;
  float wave = sin(uv.y * 15.0 + uTime * 2.0 + delay) * 0.03;
  pos.xy += normalize(pos.xy) * wave * uWave;

  // インスタンスのスケールを適用
  pos *= instanceScale;

  // インスタンスの回転を適用
  pos = applyQuaternionToVector(instanceRotation, pos);

  // インスタンスの位置を適用
  pos += instancePosition;

  // vNormal = normal;
  // vDistortion = distortion * 0.1;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  // 各インスタンスごとの回転や移動を反映
  // vec3 transformed = vec3(modelMatrix * vec4(pos, 1.0));
  // gl_Position = projectionMatrix * viewMatrix * vec4(transformed, 1.0);
}