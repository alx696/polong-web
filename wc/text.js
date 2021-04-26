customElements.define(
  'wc-text',
  class extends HTMLElement {

    /**
     * 所有需要订阅的属性应在此处定义, 被定义属性的值如果变化会通过 <code>attributeChangedCallback</code> 返回.
     * 参考 https://github.com/mdn/web-components-examples/blob/master/life-cycle-callbacks/main.js
     * @return {string[]}
     * 注意: 会在 constructor() 前调用!
     */
    static get observedAttributes() {
      return ['wc-label', 'wc-value', 'wc-help', 'wc-error', 'wc-readonly'];
    }

    /**
     * 构造中应完成元素和无需属性设置逻辑的添加
     */
    constructor() {

      //总是最先调用
      super();

      const S = this;
      // https://developers.google.com/web/fundamentals/web-components/shadowdom
      let shadowRoot = S.attachShadow({ mode: 'open' });
      //slot元素可以将放在此元素标签中的内容放入指定位置, 实现嵌入的效果,
      // 并且标签中的内容样式和事件不丢失!
      shadowRoot.innerHTML = `
          <style>
          :host {
            display: inline-block; /* by default, custom elements are display: inline */
            contain: content; /* CSS containment FTW. */
          }

          #root {
            user-select: none;
          }

          #root>article {
            background-color: #f5f5f5;
            border-radius: 6px 6px 0 0;
            border-bottom: 2px solid gray;
            padding: 0.5rem 1rem;
            display: grid;
            grid-template-columns: 1fr auto;
            grid-template-areas:
              "a c"
              "b c";
            gap: 0.5rem;
          }

          #root>article:hover {
            background-color: #eeeeee;
          }
      
          #root>article>header {
            grid-area: a;
            font-size: 80%;
            color: gray;
          }
      
          #root>article>div {
            grid-area: b;
          }
      
          #root>article>div>input {
            outline: none;
            border: none;
            background: none;
            display: inline-block;
            box-sizing: border-box;
            width: 100%;
            padding: 0.25rem 0;
            font-size: 100%;
          }

          #root>article>div>input[readonly] {
            cursor: default;
          }
      
          #root>article>footer {
            grid-area: c;
            display: flex;
            align-items: center;
          }
      
          #root>footer {
            font-size: 80%;
            color: gray;
          }
      
          #tipHelp,
          #tipError {
            margin: 0 1rem;
          }
      
          #tipError {
            display: none;
            color: red;
          }
      
          #root.error>article>header,
          #root.error>article>footer {
            color: red;
          }
      
          #root.error>article {
            border-bottom-color: red;
          }
      
          #root.error #tipHelp {
            display: none;
          }
      
          #root.error #tipError {
            display: block;
          }
          </style>
  
          <div id="root">
            <article>
              <header id="label">标签</header>
              <div>
                <input id="text">
              </div>
              <footer><slot></slot></footer>
            </article>
            <footer>
              <div id="tipHelp"></div>
              <div id="tipError"></div>
            </footer>
          </div>
        `;

      S.ui_root = shadowRoot.querySelector('#root');
      S.ui_label = shadowRoot.querySelector('#label');
      S.ui_text = shadowRoot.querySelector('#text');
      S.ui_tipHelp = shadowRoot.querySelector('#tipHelp');
      S.ui_tipError = shadowRoot.querySelector('#tipError');

      //设置订阅属性变动回调(初始设置也会调用这里)
      S.attributeChangedCallbackMap = new Map();
      S.attributeChangedCallbackMap.set('wc-label', (v) => {
        if (v === null) {
          return;
        }

        S.ui_label.textContent = v;
      });
      S.attributeChangedCallbackMap.set('wc-value', (v) => {
        if (v === null) {
          return;
        }

        S.ui_text.value = v;
      });
      S.attributeChangedCallbackMap.set('wc-help', (v) => {
        if (v === null) {
          return;
        }

        S.ui_tipHelp.textContent = v;
      });
      S.attributeChangedCallbackMap.set('wc-error', (v) => {
        if (v === null) {
          S.ui_root.classList.remove('error');
          return;
        }

        S.ui_tipError.textContent = v;
        S.ui_root.classList.add('error');
      });
      S.attributeChangedCallbackMap.set('wc-readonly', (v) => {
        if (v === null) {
          return;
        }

        S.ui_text.setAttribute('readonly', 'readonly');
      });

      //修改内容时同步到属性
      S.ui_text.addEventListener('input', () => {
        const text = S.ui_text.value;
        S.setAttribute('wc-value', text);

        S.dispatchEvent(
          new CustomEvent(
            'custom-text',
            {
              detail: text
            }
          )
        );
      });

      S.ui_root.querySelector('article').addEventListener('click', () => {
        S.ui_text.focus();
      });

    }

    /**
     * 返回在 <code>static get observedAttributes()</code> 中定义属性的值的变化.
     * 注意: 设置初始属性也会触发此回调!
     * @param name 属性名称
     * @param oldValue 先前的值
     * @param newValue 现在的值
     */
    attributeChangedCallback(name, oldValue, newValue) {
      // console.debug('属性变化:', name, oldValue, newValue);
      if (newValue === 'null' || newValue === 'undefined') {
        newValue = null;
      }
      this.attributeChangedCallbackMap.get(name)(newValue);
    }

  }
);