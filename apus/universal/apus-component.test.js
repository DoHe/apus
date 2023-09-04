/* eslint-disable no-undef */
import '../server/shim.js';
import ApusComponent from './apus-component.js';

import { css, html } from '../utils/tags.js';

class TestComponent extends ApusComponent {
  props() {
    return { count: { default: 0, type: 'int' } };
  }

  styles() {
    return css`.count { color: red; }`;
  }

  template() {
    return html`
      <button @click="increaseCount">+</button>
      <span class="count">{{ count }}</span>
      <div if="isCountHigh">That is a high count</div>
    `;
  }

  increaseCount() {
    this.data.count += 1;
  }

  isCountHigh() {
    return this.data.count > 20;
  }
}

test('compileShadowTemplate default count', () => {
  const instance = new TestComponent();
  const expectedTemplate = html`
  <style>
    .count { color: red; }
  </style>
  <button data-eventid="1" @click="increaseCount">+</button>
  <span class="count"><span data-propid="count">0</span></span>
  <template if="isCountHigh"><div if="isCountHigh">That is a high count</div></template>
  `;
  const actualTemplate = instance.compileShadowTemplate();
  expect(actualTemplate.replace(/\s+/g, ' ')).toBe(expectedTemplate.replace(/\s+/g, ' '));
});

test('compileShadowTemplate high count', () => {
  const instance = new TestComponent({ count: 30 });
  const expectedTemplate = html`
  <style>
    .count { color: red; }
  </style>
  <button data-eventid="1" @click="increaseCount">+</button>
  <span class="count"><span data-propid="count">30</span></span>
  <div if="isCountHigh">That is a high count</div>
  `;
  const actualTemplate = instance.compileShadowTemplate();
  expect(actualTemplate.replace(/\s+/g, ' ')).toBe(expectedTemplate.replace(/\s+/g, ' '));
});
