customElements.define(
  'wc-dialog',
  class extends HTMLElement {

    /**
     * 所有需要订阅的属性应在此处定义, 被定义属性的值如果变化会通过 <code>attributeChangedCallback</code> 返回.
     * 参考 https://github.com/mdn/web-components-examples/blob/master/life-cycle-callbacks/main.js
     * @return {string[]}
     * 注意: 会在 constructor() 前调用!
     */
    static get observedAttributes() {
      return ['wc-title', 'wc-cancel', 'wc-button'];
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
              display: block; /* by default, custom elements are display: inline */
            }

            /* 滚动:整体 */
            .hs::-webkit-scrollbar {
              width: 0.5rem;
              height: 0.5rem;
            }
  
            /* 滚动:背景 */
            .hsv::-webkit-scrollbar-track {
              background-color: unset;
            }
  
            /* 滚动:条块 */
            .hs::-webkit-scrollbar-thumb {
              background-color: #72a5bb;
              border-radius: 1rem;
            }
  
            #root {
              position: absolute;
              top: 0;
              right: 0;
              bottom: 0;
              left: 0;
              background-color: rgba(0, 0, 0, 0.1);
              display: flex;
              align-items: center;
              justify-content: center;
            }
  
            #root>div {
                max-width: 90%;
                max-height: 90%;
                border-radius: 6px;
                background-color: #ffffff;
                box-shadow: 0.5rem 1rem 1rem #cccccc;
                display: grid;
                grid-template-rows: auto 1fr auto;
                grid-template-columns: 1fr;
            }
  
            #root>div>header {
              padding: 1rem;
              font-weight: bold;
            }
  
            #root>div>article {
              background-color: #ffffff;
              padding: 0 1rem;
              overflow: auto;
            }
  
            #root>div>article>div {
              min-width: 240px;
            }
  
            #root>div>footer {
              padding: 1rem;
              text-align: right;
            }
  
            #root>div>footer>button {
                outline: none;
                margin: 0 0.25rem;
                border: 1px solid #e3f2fd;
                border-radius: 0.3rem;
                padding: 0.5rem 1rem;
                background: none;
                color: #1e88e5;
                cursor: pointer;
            }
  
            #root>div>footer>button:hover {
                background-color: #e3f2fd;
            }
            
            #root>div>footer>button#cancel {
                color: #2196f3;
            }
          </style>
  
          <div id="root">
            <div>
              <header id="title"></header>
              <article class="hs">
                <div>
                  <slot></slot>
                </div>
              </article>
              <footer id="footer">
                <button id="cancel">关闭</button>
              </footer>
            </div>
          </div>
        `;

      S.ui_title = shadowRoot.querySelector('#title');
      S.ui_footer = shadowRoot.querySelector('#footer');
      S.ui_cancel = shadowRoot.querySelector('#cancel');

      //设置订阅属性变动回调(初始设置也会调用这里)
      S.attributeChangedCallbackMap = new Map();
      S.attributeChangedCallbackMap.set('wc-title', (v) => {
        if (v === null) {
          S.ui_title.textContent = '提示';
          return;
        }

        S.ui_title.textContent = v;
      });
      S.attributeChangedCallbackMap.set('wc-cancel', (v) => {
        if (v === null) {
          S.ui_cancel.textContent = '关闭';
          return;
        }

        if (v === '') {
          S.ui_cancel.style.display = 'none';
        } else {
          S.ui_cancel.style.display = 'inline-block';
          S.ui_cancel.textContent = v;
        }
      });
      S.attributeChangedCallbackMap.set('wc-button', (v) => {
        for (let e of shadowRoot.querySelectorAll('button:not([id="cancel"])')) {
          e.remove();
        }
        if (v === null) {
          return;
        }

        for (let text of v.split(',')) {
          const e = document.createElement('button');
          e.textContent = text;
          e.addEventListener('click', () => {
            S.dispatchEvent(
              new CustomEvent(
                'custom-button',
                {
                  detail: text
                }
              )
            );
          });

          S.ui_footer.insertBefore(e, S.ui_cancel);
        }
      });

      S.ui_cancel.addEventListener('click', () => {
        S.remove();

        S.dispatchEvent(
          new CustomEvent(
            'custom-close',
            {
              detail: '关闭'
            }
          )
        );
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