customElements.define(
  'wc-loading',
  class extends HTMLElement {

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
          }

          #root {
            display: inline-grid;
            grid-template-rows: 16px;
            grid-template-columns: 16px 16px 16px;
          }
      
          #root>div {
            display: flex;
            align-items: center;
            justify-content: center;
          }
      
          @keyframes b1 {
            0%, 40% {
              width: 10%;
              height: 10%;
            }
      
            30% {
              width: 60%;
              height: 60%;
            }
          }
      
          @keyframes b2 {
            0%, 70% {
              width: 10%;
              height: 10%;
            }
      
            30% {
              width: 30%;
              height: 30%;
            }
      
            60% {
              width: 60%;
              height: 60%;
            }
          }
      
          @keyframes b3 {
            0%, 90% {
              width: 10%;
              height: 10%;
            }
      
            60% {
              width: 30%;
              height: 30%;
            }
      
            80% {
              width: 60%;
              height: 60%;
            }
          }
      
          #root>div>div {
            border-radius: 100%;
            width: 10%;
            height: 10%;
            background-color: orange;
            animation-duration: 1s;
            animation-iteration-count: infinite;
          }
      
          #root>div:nth-child(1)>div {
            animation-name: b1;
          }
      
          #root>div:nth-child(2)>div {
            animation-name: b2;
          }
      
          #root>div:nth-child(3)>div {
            animation-name: b3;
          }
          </style>
  
          <div id="root">
          <div>
            <div></div>
          </div>
          <div>
            <div></div>
          </div>
          <div>
            <div></div>
          </div>
        </div>
        `;

    }

  }
);