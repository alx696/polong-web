/**
 * 创建元素
 * @param html
 * @return {ChildNode}
 */
const $e = (html) => {
    let template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
};

const app = {
    host: null, //主机
    versionName: null, //版本
    onlineVersionName: null,
    website: 'https://lilu.red/app/pl/',
    id: null,
    option: null,
    contactMap: new Map(),
    contactActive: null,
    chatMessageMap: new Map(),
    imageExtensionArray: ['webp', 'png', 'jpg', 'jpeg', 'bmp'],
    videoExtensionArray: ['webm', 'mp4'],

    /**
     * 返回[File,DataURL]
     * @param {*} file 
     * @param {*} maxWidth 
     * @param {*} maxHeight 
     */
    scaleImage(file, maxWidth, maxHeight) {
        return new Promise((resolve) => {
            const objectURL = URL.createObjectURL(file);
            const image = new Image();
            image.onload = () => {
                URL.revokeObjectURL(objectURL);

                //计算保持比例缩放后的大小
                let w = image.width;
                let h = image.height;
                if (w > maxWidth) {
                    h = maxWidth / w * h;
                    w = maxWidth;
                }
                if (h > maxHeight) {
                    w = maxHeight / h * w;
                    h = maxHeight;
                }
                console.debug('保持比例缩放后的大小:', w, h);

                //进行缩放
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                canvas.style = 'display: none;';
                document.body.appendChild(canvas);
                const canvasContext = canvas.getContext('2d');
                canvasContext.drawImage(image, 0, 0, canvas.width, canvas.height);

                //返回图片
                canvas.toBlob((blob) => {
                    resolve([
                        new File([blob], file.name, { type: file.type }),
                        canvas.toDataURL('image/png')
                    ]);
                }, file.type, 1);

                // //图片的Base64字符的下载
                // // https://gist.github.com/makevoid/1659616#file-img_resize-js-L53
                // const stream = canvas.toDataURL(file.type)
                //     .replace(file.type, 'image/octet-stream');
                // const a = document.createElement('a');
                // a.href = stream;
                // a.download = file.name;
                // a.click();
            };
            image.src = objectURL;
        });
    },

    /**
     * 文件大小
     * @param {*} size 
     */
    fileSize(size) {
        let s = size;
        let u = 'B';
        if (size > 1024) {
            s = (size / 1024).toFixed(1);
            u = 'KB';
        }

        if (size > 1048576) {
            s = (size / 1048576).toFixed(1);
            u = 'MB';
        }

        if (size > 1073741824) {
            s = (size / 1073741824).toFixed(1);
            u = 'GB';
        }
        return `${s}${u}`;
    },

    /**
     * DataURL转File
     */
    dataUrlToFile(dataURL, filename) {
        let arr = dataURL.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    },

    /**
     * 时间戳转时间
     * @param {*} ts 
     */
    datetime(ts) {
        const date = new Date(
            parseInt(ts)
        );
        const withZero = (v) => {
            if (v < 10) {
                return `0${v}`;
            }
            return v;
        };

        return `${date.getFullYear()}-${withZero(date.getMonth() + 1)}-${withZero(date.getDate())} ${withZero(date.getHours())}:${withZero(date.getMinutes())}:${withZero(date.getSeconds())}`;
    },

    /**
     * 复制文本(body必须设置position: relative;)
     * @param {*} text 
     */
    copyText(text) {
        const input = $e(`<input style="position: absolute; top: -100px; left: -100px;" value="${text}">`);
        document.body.append(input);
        input.select();
        document.execCommand('copy');
        input.remove();
    },

    // 显示浮动提示
    showFloatTips(content, e) {
        const ui = $e(`<div class="float-tips"></div>`);
        ui.append(content);
        document.body.append(ui);

        if (e !== undefined) {
            //计算页面中的绝对位置
            let top = e.pageY + ui.clientHeight;
            let left = e.pageX;

            //防止元素超出页面边界
            if (top > document.body.clientHeight) {
                top = document.body.clientHeight - ui.clientHeight;
            }
            if (left < 0) {
                left = 0;
            } else if (left > document.body.clientWidth) {
                left = document.body.clientWidth - ui.clientWidth;
            }

            //设置位置
            ui.style.top = `${top}px`;
            ui.style.left = `${left}px`;
        }

        window.setTimeout(() => {
            ui.remove();
        }, 1500);
    },

    api: {
        optionBootstrap(host, arrayText) {
            return new Promise((s, f) => {
                let formData = new FormData();
                formData.set('arrayText', arrayText);

                fetch(
                    `http://${host}/api1/option/bootstrap`,
                    {
                        method: 'POST',
                        body: formData
                    }
                )
                    .then(resp => {
                        if (resp.status !== 200) {
                            resp.text().then(f);
                        } else {
                            s();
                        }
                    })
                    .catch(f);
            });
        },

        optionBlacklist(host, arrayText) {
            return new Promise((s, f) => {
                let formData = new FormData();
                formData.set('arrayText', arrayText);

                fetch(
                    `http://${host}/api1/option/blacklist`,
                    {
                        method: 'POST',
                        body: formData
                    }
                )
                    .then(resp => {
                        if (resp.status !== 200) {
                            f(resp.status);
                        } else {
                            s();
                        }
                    })
                    .catch(f);
            });
        },

        newContact(host, id) {
            return new Promise((s, f) => {
                let formData = new FormData();
                formData.set('id', id);

                fetch(
                    `http://${host}/api1/contact`,
                    {
                        method: 'POST',
                        body: formData
                    }
                )
                    .then(resp => {
                        if (resp.status !== 200) {
                            resp.text()
                                .then(f);
                        } else {
                            resp.json()
                                .then(s);
                        }
                    })
                    .catch(f);
            });
        },

        contactNameRemark(host, id, name) {
            return new Promise((s, f) => {
                let formData = new FormData();
                formData.set('id', id);
                formData.set('name', name);

                fetch(
                    `http://${host}/api1/contact/name/remark`,
                    {
                        method: 'POST',
                        body: formData
                    }
                )
                    .then(resp => {
                        if (resp.status !== 200) {
                            f(resp.status);
                        } else {
                            s();
                        }
                    })
                    .catch(f);
            });
        },

        contactConnect(host) {
            return new Promise((s, f) => {
                fetch(
                    `http://${host}/api1/contact/connect`
                )
                    .then(resp => {
                        if (resp.status !== 200) {
                            f(resp.status);
                        } else {
                            resp.json()
                                .then(s);
                        }
                    })
                    .catch(f);
            });
        },

        chatMessageReadGet(host) {
            return new Promise((s, f) => {
                fetch(
                    `http://${host}/api1/chat/message/read`
                )
                    .then(resp => {
                        if (resp.status !== 200) {
                            f(resp.status);
                        } else {
                            resp.json()
                                .then(s);
                        }
                    })
                    .catch(f);
            });
        },

        chatMessageReadSet(host, id) {
            return new Promise((s, f) => {
                let formData = new FormData();
                formData.set('peerID', id);

                fetch(
                    `http://${host}/api1/chat/message/read`,
                    {
                        method: 'POST',
                        body: formData
                    }
                )
                    .then(resp => {
                        if (resp.status !== 200) {
                            f(resp.status);
                        } else {
                            s();
                        }
                    })
                    .catch(f);
            });
        },

        dnsTxt(domain) {
            return new Promise((s, f) => {
                // 获取网址
                fetch(
                    `https://doh.pub/dns-query?type=16&name=${domain}`,
                    {
                        headers: {
                            'accept': 'application/dns-json'
                        }
                    }
                )
                    .then(resp => {
                        if (resp.status !== 200) {
                            f(resp.status);
                            return;
                        }

                        return resp.json();
                    }).then(result => {
                        if (result.Answer && result.Answer.length > 0) {
                            let data = result.Answer[0].data;
                            data = data.substring(1, data.length - 1);
                            s(data);
                        } else {
                            f('没有记录');
                        }
                    })
                    .catch(f);
            });
        },
    },

    async updateChatMessageState(messageID, state) {
        const S = this;
        const data = S.chatMessageMap.get(messageID);
        data.state = state;
        const chatMessageList = document.body.querySelector('#chatMessageList');
        let ui = chatMessageList.querySelector(`[data-id="${messageID}"]`);
        if (!ui) {
            return;
        }

        const headerUI = ui.querySelector('header');
        const contentUI = ui.querySelector('div');

        headerUI.textContent = state;
        if (state === '失败') {
            headerUI.style.color = 'red';
        } else if (state === '发送' || state === '接收') {
            headerUI.style.color = 'orange';
        }

        if (state === '完成') {
            // 发送时间超过1小时的显示时间
            const ts = parseInt(String(messageID).substring(0, 13));
            if (Date.now() - ts > 3600000) {
                headerUI.textContent = S.datetime(ts);
            } else {
                headerUI.style.display = 'none';
            }
        }

        // 文件处理(完成状态或自己发送的: 可以下载, 显示预览)
        if (data.file_size > 0 && ((data.state === '完成' && data.fromPeerID !== S.id) || ((data.state === '失败' || data.state === '完成') && data.fromPeerID === S.id))) {
            const fileURL = `http://${S.host}/api1/file?path=${encodeURI(data.file_path)}`;

            // 点击打开文件
            ui.querySelector('.chat-message-file-info').addEventListener('click', () => {
                window.electron.openPath(data.file_path)
                    .then(result => {
                        if(result !== '') {
                            alert('文件没有找到');
                        };
                    });

                // const a = document.createElement('a');
                // a.setAttribute('href', fileURL);
                // a.setAttribute('download', data.file_name);
                // a.style.display = 'none';
                // document.body.append(a);
                // a.click();

                // setTimeout(() => {
                //     a.remove();
                // }, 1000);
            });

            // 显示预览
            if (S.imageExtensionArray.includes(data.file_extension.toLowerCase())) {
                const imagePreview = $e(`<div class="chat-message-file-preview">
                    <img src="${fileURL}">
                </div>`);

                const sizeText = localStorage.getItem(`size-${data.id}`);
                if (sizeText !== null) {
                    let splitArray = sizeText.split(',');
                    let h = contentUI.clientWidth * parseInt(splitArray[1]) / parseInt(splitArray[0]);
                    imagePreview.style.height = `${h}px`;
                }
                imagePreview.querySelector('img').addEventListener('load', e => {
                    imagePreview.style.height = 'auto';
                    //缓存尺寸
                    localStorage.setItem(
                        `size-${data.id}`,
                        `${e.target.clientWidth},${e.target.clientHeight}`
                    );
                });

                contentUI.append(imagePreview);
            } else if (S.videoExtensionArray.includes(data.file_extension.toLowerCase())) {
                const videoPreview = $e(`<div class="chat-message-file-preview">
                    <video controls src="${fileURL}"></video>
                </div>`);

                const sizeText = localStorage.getItem(`size-${data.id}`);
                if (sizeText !== null) {
                    let splitArray = sizeText.split(',');
                    let h = contentUI.clientWidth * parseInt(splitArray[1]) / parseInt(splitArray[0]);
                    videoPreview.style.height = `${h}px`;
                }
                videoPreview.querySelector('video').addEventListener('loadedmetadata', e => {
                    videoPreview.style.height = 'auto';
                    //缓存尺寸
                    localStorage.setItem(
                        `size-${data.id}`,
                        `${e.target.clientWidth},${e.target.clientHeight}`
                    );
                });

                contentUI.append(videoPreview);
            }
        }

        //滚动到底部
        chatMessageList.scrollTo(0, chatMessageList.scrollHeight);
    },

    async showChatMessage(data) {
        const S = this;
        S.chatMessageMap.set(data.id, data);
        const chatMessageList = document.body.querySelector('#chatMessageList');
        let ui = chatMessageList.querySelector(`[data-id="${data.id}"]`);

        if (!ui) {
            ui = $e(`<section data-id="${data.id}" class="chat-message">
            <header>状态</header>
            <div></div>
            <footer></footer>
          </section>`);

            const contentElement = ui.querySelector('div');
            if (data.file_size > 0) {
                const fileElement = $e(`<div class="chat-message-file-info">
                <aside class="material-icons">attachment</aside>
                <div>${data.file_name}</div>
                <footer>${S.fileSize(data.file_size)}</footer>
              </div>`);
                contentElement.append(fileElement);
            } else {
                contentElement.textContent = data.text;
            }

            chatMessageList.append(ui);

            if (data.fromPeerID === S.id) {
                ui.classList.add('chat-message-self');
            }

            ui.addEventListener('click', () => {
                //
            });
        }

        S.updateChatMessageState(data.id, data.state);
    },

    async updateChatContactInfo() {
        const S = this;

        // 更新头像名字
        document.body.querySelector('#targetPhoto').style.backgroundImage = `url(${S.contactActive.photo_url})`;
        document.body.querySelector('#targetName').textContent = S.contactActive.nameRemark !== '' ? S.contactActive.nameRemark : S.contactActive.name;
    },

    async showChat() {
        const S = this;

        document.body.querySelector('#chatHeader').style.display = 'none';
        document.body.querySelector('.ui-chat-main-tips').style.display = 'none';
        S.updateChatContactInfo();

        // 加载会话消息
        S.chatMessageMap.clear();
        document.body.querySelector('#chatMessageList').innerHTML = '';
        fetch(`http://${S.host}/api1/chat/message?peerID=${S.contactActive.id}`)
            .then(resp => {
                if (resp.status !== 200) {
                    alert(resp.status);
                    return;
                }

                resp.json()
                    .then(result => {
                        for (const data of result) {
                            S.showChatMessage(data);
                        }
                    });
            });

        // 标记会话消息已读
        S.api.chatMessageReadSet(S.host, S.contactActive.id)
            .then(() => {
                S.updateContactChatMessageUnReadCount(S.contactActive.id, 0);
            });
    },

    async deleteContact(id) {
        const S = this;
        S.contactMap.delete(id);

        const contactList = document.body.querySelector('#contactList');
        let ui = contactList.querySelector(`[data-id="${id}"]`);
        if (ui) {
            ui.remove();
        }

        if (contactList.childElementCount === 1) {
            contactList.querySelector('.ui-contact-tips').style.display = 'block';
        }

        if (S.contactActive !== null && S.contactActive.id === id) {
            S.contactActive = null;
            document.body.querySelector('#chatHeader').style.display = 'flex';
            document.body.querySelector('#chatMessageList').innerHTML = '';
        }
    },

    async updateContactChatMessageUnReadCount(id, count) {
        const unReadCountElement = document.body.querySelector(`#contactList>[data-id="${id}"] [data-id="unReadCount"]`);
        if (count === undefined || count === 0) {
            unReadCountElement.style.display = 'none';
        } else {
            unReadCountElement.style.display = 'block';
            if (count > 9) {
                unReadCountElement.textContent = '9+';
            } else {
                unReadCountElement.textContent = count;
            }
        }
    },

    async showContact(data) {
        const S = this;

        S.contactMap.set(data.id, data);

        const contactList = document.body.querySelector('#contactList');
        contactList.querySelector('.ui-contact-tips').style.display = 'none';
        let ui = contactList.querySelector(`[data-id="${data.id}"]`);

        // 头像
        if (data.photo !== '' && data.photo_url === undefined) {
            data.photo_url = URL.createObjectURL(
                S.dataUrlToFile(`data:image/png;base64,${data.photo}`, '头像.png')
            );
        }

        if (!ui) {
            ui = $e(`<section data-id="${data.id}" class="contact">
            <aside>
              <div class="photo"></div>
            </aside>
            <div>名字</div>
            <div>
                <div data-id="unReadCount">9+</div>
            </div>
            <div data-id="textState">${data.id.substring(data.id.length - 4)}</div>
            <div>
                <span data-id="linkIcon" class="material-icons">link_off</span>
            </div>
          </section>`);
            contactList.append(ui);

            ui.addEventListener('click', () => {
                const active = contactList.querySelector('section.active');
                if (active) {
                    active.classList.remove('active');
                }

                ui.classList.add('active');

                S.contactActive = S.contactMap.get(ui.getAttribute('data-id'));
                S.showChat();
            });
        }

        const linkIconElement = ui.querySelector('[data-id="linkIcon"]');
        const textStateElement = ui.querySelector('[data-id="textState"]');
        ui.querySelector('aside>div').style.backgroundImage = `url(${data.photo_url})`;
        ui.querySelector('div:nth-child(2)').textContent = data.nameRemark !== '' ? data.nameRemark : data.name;

        // 获取未读消息数量
        Promise.all([
            S.api.contactConnect(S.host),
            S.api.chatMessageReadGet(S.host)
        ])
            .then(results => {
                // console.debug(results);

                if (results[0].includes(data.id)) {
                    //连接
                    linkIconElement.textContent = 'link';
                } else {
                    //没有连接
                    linkIconElement.textContent = 'link_off';
                }

                S.updateContactChatMessageUnReadCount(data.id, results[1][data.id]);
            });
    },

    /**
     * 显示我的信息编辑器
     * @param {*} callback () => {}
     * @param {*} disableCancel 
     */
    async showMyInfoEditor(callback, disableCancel) {
        const S = this;

        let cancelText = '取消';
        if (disableCancel) {
            cancelText = '';
        }

        const dialog = $e(`<wc-dialog wc-title="设置我的信息" wc-cancel="${cancelText}" wc-button="确定">
                <form class="contact-info-form">
                    <wc-text wc-label="名字" wc-value="${S.option.name}" wc-help="填个响亮的外号, 选个帅气的头像"></wc-text>
                    <div class="photo" title="点击设置头像"></div>
                </form>
            </wc-dialog>`);
        const textElement = dialog.querySelector('form>wc-text');
        const asideElement = dialog.querySelector('form>div');

        let photo = S.option.photo;
        if (photo !== '') {
            asideElement.style.backgroundImage = `url(data:image/png;base64,${photo})`;
        }
        asideElement.addEventListener('click', () => {
            const fileInput = $e(`<input type="file" accept="image/png,image/jpeg,image/webp" style="display: none;">`);
            document.body.append(fileInput);
            fileInput.addEventListener('change', () => {
                const file = fileInput.files[0];
                console.debug('文件:', file);

                if (!file.type.includes('image/')) {
                    document.body.append(
                        $e(`<wc-dialog wc-title="提示">只能选择jpg, png, webp格式文件</wc-dialog>`)
                    );
                    return;
                }

                S.scaleImage(file, 512, 512)
                    .then((results) => {
                        photo = results[1];
                        asideElement.style.backgroundImage = `url(${photo})`;
                        asideElement.style.border = 'none';
                    });
            });
            fileInput.click();
        });
        dialog.addEventListener('custom-button', evt => {
            if (evt.detail !== '确定') {
                return;
            }

            const name = textElement.getAttribute('wc-value');
            if (name === '') {
                textElement.setAttribute('wc-error', '名字没有填写');
                return;
            }
            if (photo === '') {
                asideElement.style.border = '2px solid red';
                return;
            }

            dialog.remove();

            // 去掉Data头
            if (photo.includes(',')) {
                photo = (photo.split(','))[1];
            }

            // 保存
            let formData = new FormData();
            formData.set('name', name);
            formData.set('photo', photo);
            fetch(
                `http://${S.host}/api1/option/info`,
                {
                    method: 'POST',
                    body: formData
                }
            )
                .then(resp => {
                    if (resp.status !== 200) {
                        alert(resp.status);
                        return;
                    }

                    S.option.name = name;
                    S.option.photo = photo;
                    S.option.photo_url = `data:image/png;base64,${photo}`;

                    // 回调
                    callback();
                });
        });

        document.body.append(dialog);
    },

    async showOptionWindow() {
        const S = this;
        const dialog = $e(`<wc-dialog wc-title="设置">
            <div class="contact-info-card">
                <div>
                    <div class="label">破号</div>
                    <div class="id">${S.id}</div>
                    <div><button data-id="copyID">复制</button></div>

                    <div class="label">信息</div>
                    <div class="info">
                        <div><div class="photo"></div></div>
                        <div data-id="name">${S.option.name}</div>
                    </div>
                    <div><button data-id="editInfo">修改</button></div>
                </div>
                <aside data-id="qrcode"></aside>
            </div>
            <h5>超级破址:</h5>
            <p><textarea name="bootstrap"></textarea></p>
            <p class="remark">每行填写一个破址.</p>
            <h5>黑名单:</h5>
            <p><textarea name="blacklist"></textarea></p>
            <p class="remark">每行填写一个破号.</p>
        </wc-dialog>`);

        const photoElement = dialog.querySelector('div.photo');
        const nameElement = dialog.querySelector('[data-id="name"]');
        const qrcodeElement = dialog.querySelector('[data-id="qrcode"]');
        const bootstrapElement = dialog.querySelector('textarea[name="bootstrap"]');
        const blacklistElement = dialog.querySelector('textarea[name="blacklist"]');

        photoElement.style.backgroundImage = document.body.querySelector('#selfInfoPhoto').style.backgroundImage;
        dialog.querySelector('button[data-id="editInfo"]').addEventListener('click', () => {
            S.showMyInfoEditor(
                () => {
                    document.body.querySelector('#selfInfoPhoto').style.backgroundImage = `url(${S.option.photo_url})`;
                    photoElement.style.backgroundImage = document.body.querySelector('#selfInfoPhoto').style.backgroundImage;
                    nameElement.textContent = S.option.name;
                },
                false
            );
        });
        fetch(`http://${S.host}/api1/qrcode?text=${encodeURI(S.id)}`)
            .then(resp => {
                const qrcodeURL = `http://${S.host}/api1/file?fileName=${encodeURI('qrcode.jpg')}`;
                qrcodeElement.style.backgroundImage = `url(${qrcodeURL})`;
            });

        bootstrapElement.value = S.option.bootstrap_array.join('\n');
        bootstrapElement.addEventListener('change', () => {
            const arrayText = bootstrapElement.value.replaceAll('\n', ',');
            S.api.optionBootstrap(S.host, arrayText)
                .then(() => {
                    if (arrayText === "") {
                        S.option.bootstrap_array = [];
                    } else {
                        S.option.bootstrap_array = arrayText.split(',');
                    }
                })
                .catch(error => {
                    document.body.append(
                        $e(`<wc-dialog wc-title="提示">${error}</wc-dialog>`)
                    );
                });
        });

        blacklistElement.value = S.option.blacklist_id_array.join('\n');
        blacklistElement.addEventListener('change', () => {
            const arrayText = blacklistElement.value.replaceAll('\n', ',');
            S.api.optionBlacklist(S.host, arrayText)
                .then(() => {
                    if (arrayText === "") {
                        S.option.blacklist_id_array = [];
                    } else {
                        S.option.blacklist_id_array = arrayText.split(',');
                    }
                });
        });

        dialog.addEventListener('custom-button', evt => {
            if (evt.detail !== '确定') {
                return;
            }

            //
        });

        document.body.append(dialog);

        dialog.querySelector('[data-id="copyID"]').addEventListener('click', e => {
            S.copyText(S.id);
            S.showFloatTips('已经复制', e);
        });
    },

    async showContactInfoWindow() {
        const S = this;
        const dialog = $e(`<wc-dialog class="contact-info-window" wc-title="信息">
            <div class="contact-info-card">
                <div>
                    <div class="label">破号</div>
                    <div class="id">${S.contactActive.id}</div>
                    <div><button data-id="copyID">复制</button></div>

                    <div class="label">信息</div>
                    <div class="info">
                        <div><div class="photo"></div></div>
                        <div data-id="name">${S.contactActive.name}</div>
                    </div>
                    <div><button data-id="updateInfo">更新</button></div>
                </div>
                <aside data-id="qrcode"></aside>
            </div>
            <p><wc-text data-id="nameRemark" wc-label="名字备注" wc-value="${S.contactActive.nameRemark}"></wc-text></p>
        </wc-dialog>`);

        const photoElement = dialog.querySelector('div.photo');
        const nameElement = dialog.querySelector('[data-id="name"]');
        const qrcodeElement = dialog.querySelector('[data-id="qrcode"]');
        const nameRemarkElement = dialog.querySelector('[data-id="nameRemark"]');

        photoElement.style.backgroundImage = `url(${S.contactActive.photo_url})`;
        fetch(`http://${S.host}/api1/qrcode?text=${encodeURI(S.contactActive.id)}`)
            .then(resp => {
                const qrcodeURL = `http://${S.host}/api1/file?fileName=${encodeURI('qrcode.jpg')}`;
                qrcodeElement.style.backgroundImage = `url(${qrcodeURL})`;
            });

        document.body.append(dialog);

        dialog.querySelector('button[data-id="updateInfo"]').addEventListener('click', e => {
            e.target.style.display = 'none';
            const loading = $e(`<wc-loading></wc-loading>`);
            e.target.parentNode.append(loading);
            const done = () => {
                loading.remove();
                e.target.style.display = 'inline-block';
            };

            S.api.newContact(S.host, S.contactActive.id)
                .then(result => {
                    done();
                    photoElement.style.backgroundImage = `url(data:image/png;base64,${result.photo})`;
                    nameElement.textContent = result.name;
                })
                .catch(error => {
                    done();
                    document.body.append(
                        $e(`<wc-dialog wc-title="提示">${error}</wc-dialog>`)
                    );
                });
        });

        dialog.querySelector('[data-id="copyID"]').addEventListener('click', e => {
            S.copyText(S.contactActive.id);
            S.showFloatTips('已经复制', e);
        });

        nameRemarkElement.addEventListener('custom-text', e => {
            S.api.contactNameRemark(S.host, S.contactActive.id, e.detail);
        });
    },

    async showAddContactWindow() {
        const S = this;
        const textElement = $e(`<wc-text wc-label="破号" wc-help="填写对方破号"></wc-text>`);
        const dialog = $e(`<wc-dialog class="contact-add-window" wc-title="添加破友" wc-button="添加"></wc-dialog>`);
        dialog.append(textElement);
        document.body.append(dialog);

        dialog.addEventListener('custom-button', e => {
            if (e.detail !== '添加') {
                return;
            }

            const id = textElement.getAttribute('wc-value');
            if (id === null || id.length !== 52) {
                textElement.setAttribute('wc-error', '没有填写正确的破号!');
                return;
            }

            textElement.setAttribute('wc-readonly', 'readonly');
            const loading = $e(`<wc-loading></wc-loading>`);
            textElement.parentNode.append(loading);
            const done = () => {
                loading.remove();
                textElement.removeAttribute('wc-readonly');
            };

            S.api.newContact(S.host, id)
                .then(result => {
                    done();
                    dialog.remove();
                })
                .catch(error => {
                    done();
                    document.body.append(
                        $e(`<wc-dialog wc-title="提示">${error}</wc-dialog>`)
                    );
                });
        });
    },

    async showAppInfoWindow() {
        const S = this;
        const dialog = $e(`<wc-dialog class="app-info-window" wc-title="应用信息" wc-button="访问网站">
            <p>探索平等自由网络，请访问应用网站：<a href="${S.website}" target="_blank">${S.website}</a></p>
            <p>版本：${S.versionName}</p>
            <div class="app-info-window-update-tips">新版已经发布，请访问网站了解并下载安装。</div>
        </wc-dialog>`);
        document.body.append(dialog);

        const updateTipsElement = dialog.querySelector('.app-info-window-update-tips');
        if (S.onlineVersionName !== null && S.onlineVersionName !== S.versionName) {
            updateTipsElement.style.display = 'block';
        }

        dialog.addEventListener('custom-button', e => {
            open(S.website);
        });
    },

    // 初始化
    async init(host, versionName) {
        const S = this;
        S.host = host;
        S.versionName = versionName;
        console.info(S.host, S.versionName);

        await import('./wc/text.js');
        await import('./wc/dialog.js');
        await import('./wc/loading.js');

        //申请通知权限
        Notification.requestPermission()
            .then(state => {
                console.debug('通知权限', state);
            });

        // 获取联系人
        const getContact = () => {
            fetch(`http://${host}/api1/contact`)
                .then(resp => {
                    if (resp.status !== 200) {
                        alert(resp.status);
                        return;
                    }

                    resp.json()
                        .then(result => {
                            for (const k of Object.keys(result)) {
                                S.showContact(result[k]);
                            }
                        });
                });
        };

        // 显示启动提示
        const wait = $e(`<wc-dialog wc-title="正在启动" wc-cancel="">破笼而出,自由通信</wc-dialog>`);
        document.body.append(wait);

        // 订阅
        const feed = () => {
            const websocket = new WebSocket(`ws://${S.host}/api1/feed`);
            websocket.addEventListener('open', () => {
                websocket.send('订阅');
            });
            websocket.addEventListener('message', evt => {
                // console.debug(evt.data);
                const push = JSON.parse(evt.data);
                if (push.type === 'ContactUpdate') {
                    const contact = JSON.parse(push.text);
                    S.showContact(contact);
                    if (S.contactActive !== null && S.contactActive.id === contact.id) {
                        S.contactActive = contact;
                        S.updateChatContactInfo();
                    }
                } else if (push.type === 'ContactDelete') {
                    S.deleteContact(push.id);
                } else if (push.type === 'ChatMessage') {
                    const chatMessage = JSON.parse(push.text);
                    const contact = S.contactMap.get(push.id);

                    //通知提醒
                    if (document.hidden) {
                        const notification = new Notification(
                            `${contact.name} 发来消息`,
                            {
                                tag: contact.id,
                                body: `${chatMessage.file_size > 0 ? `${chatMessage.file_name}` : chatMessage.text}`
                            }
                        );
                        notification.addEventListener('click', () => {
                            console.debug('点击通知');
                            window.electron.appShow();
                        });
                    }

                    if (S.contactActive !== null && (push.id === S.contactActive.id || push.id === S.id)) {
                        S.showChatMessage(chatMessage);
                        // 标记消息已读
                        if (!chatMessage.read) {
                            S.api.chatMessageReadSet(S.host, chatMessage.fromPeerID);
                        }
                        return;
                    }

                    // 更新联系人信息以刷新未读消息数量
                    if (push.id !== S.id) {
                        S.showContact(S.contactMap.get(push.id));
                    }
                } else if (push.type === 'ChatMessageState') {
                    if (S.contactActive !== null && (push.id === S.contactActive.id || push.id === S.id)) {
                        S.updateChatMessageState(
                            push.messageID, push.text
                        );
                    }
                } else if (push.type === 'PeerConnectState') {
                    const linkIconElement = document.body.querySelector(`#contactList>[data-id="${push.id}"] [data-id="linkIcon"]`);

                    if (push.isConnect) {
                        //连接
                        linkIconElement.textContent = 'link';
                    } else {
                        //没有连接
                        linkIconElement.textContent = 'link_off';
                    }
                }
            });
            websocket.addEventListener('close', evt => {
                console.warn(evt.code, evt.reason);
            });
            websocket.addEventListener('error', evt => {
                console.error(evt);
            });
        };

        // 初始界面
        const initUI = () => {
            wait.remove();

            // 我的头像
            if (S.option.photo !== '') {
                document.body.querySelector('#selfInfoPhoto').style.backgroundImage = `url(${S.option.photo_url})`;
            }

            // 添加联系人
            document.body.querySelector('#addContactButton').addEventListener('click', () => {
                S.showAddContactWindow();
            });

            // 设置
            document.body.querySelector('#setOptionButton').addEventListener('click', () => {
                S.showOptionWindow();
            });

            // 应用信息
            document.body.querySelector('#appInfoButton').addEventListener('click', () => {
                S.showAppInfoWindow();
            });

            // 联系人加入黑名单
            document.body.querySelector('#targetToBlacklist').addEventListener('click', () => {
                if (S.contactActive === null) {
                    return;
                }

                const ask = $e(`<wc-dialog wc-title="提示" wc-cancel="取消" wc-button="确认">确认加入黑名单?</wc-dialog>`);
                document.body.append(ask);
                ask.addEventListener('custom-button', e => {
                    ask.remove();

                    S.option.blacklist_id_array.push(S.contactActive.id);
                    S.api.optionBlacklist(S.host, S.option.blacklist_id_array.join(','))
                        .then(() => {
                            //
                        });
                });
            });

            // 删除联系人
            document.body.querySelector('#targetRemove').addEventListener('click', () => {
                if (S.contactActive === null) {
                    return;
                }

                const ask = $e(`<wc-dialog wc-title="提示" wc-cancel="取消" wc-button="删除">确认删除?</wc-dialog>`);
                document.body.append(ask);
                ask.addEventListener('custom-button', e => {
                    ask.remove();

                    fetch(
                        `http://${S.host}/api1/contact?id=${S.contactActive.id}`,
                        {
                            method: 'DELETE'
                        }
                    )
                        .then(resp => {
                            if (resp.status !== 200) {
                                alert(resp.status);
                                return;
                            }
                        });
                });
            });

            // 清空联系人消息
            document.body.querySelector('#targetClearMessage').addEventListener('click', () => {
                if (S.contactActive === null) {
                    return;
                }

                const ask = $e(`<wc-dialog wc-title="提示" wc-cancel="取消" wc-button="清空">确认清空消息?</wc-dialog>`);
                document.body.append(ask);
                ask.addEventListener('custom-button', e => {
                    ask.remove();

                    fetch(
                        `http://${S.host}/api1/chat/message?peerID=${S.contactActive.id}`,
                        {
                            method: 'DELETE'
                        }
                    )
                        .then(resp => {
                            if (resp.status !== 200) {
                                alert(resp.status);
                                return;
                            }

                            document.body.querySelector('#chatMessageList').innerHTML = '';
                        });
                });
            });

            // 显示联系人信息
            document.body.querySelector('#targetInfo').addEventListener('click', () => {
                if (S.contactActive === null) {
                    return;
                }

                S.showContactInfoWindow();
            });

            // 发送会话消息
            const sendChatMessage = (text, fileInfo) => {
                console.debug('发送会话消息', text, fileInfo);

                let formData = new FormData();
                formData.set('peerID', S.contactActive.id);
                formData.set('text', text === null ? '' : text);
                if (fileInfo !== null) {
                    formData.set('path', fileInfo.path);
                    formData.set('name', fileInfo.name);
                    formData.set('extension', fileInfo.extension);
                    formData.set('size', fileInfo.size);
                } else {
                    formData.set('size', 0);
                }
                fetch(
                    `http://${S.host}/api1/chat/message`,
                    {
                        method: 'POST',
                        body: formData
                    }
                )
                    .then(resp => {
                        if (resp.status !== 200) {
                            alert(resp.status);
                            return;
                        }
                    });
            };
            const sendFile = (file) => {
                console.debug('发送文件:', file);

                let extension = '';
                const pointIndex = file.name.lastIndexOf('.');
                if (pointIndex !== -1) {
                    extension = file.name.substring(pointIndex + 1);
                }

                // 直接使用路径
                sendChatMessage(null, {
                    path: file.path,
                    name: file.name,
                    extension: extension,
                    size: file.size
                });

                // // 上传文件
                // let formData = new FormData();
                // formData.set('name', file.name);
                // formData.set('file', file);
                // fetch(
                //     `http://${S.host}/api1/file`,
                //     {
                //         method: 'POST',
                //         body: formData
                //     }
                // )
                //     .then(resp => {
                //         if (resp.status !== 200) {
                //             alert(resp.status);
                //             return;
                //         }

                //         resp.text().then(path => {
                //             console.debug('文件实际存储路径', path);
                //             sendChatMessage(null, {
                //                 path: path,
                //                 name: file.name,
                //                 extension: extension,
                //                 size: file.size
                //             });
                //         });
                //     });
            };
            // 发送文件
            document.body.querySelector('#sendFile').addEventListener('click', () => {
                if (S.contactActive === null) {
                    return;
                }

                const fileInput = $e(`<input type="file" style="display: none;">`);
                document.body.append(fileInput);
                fileInput.addEventListener('change', () => {
                    const file = fileInput.files[0];
                    console.debug('选择文件: ', file.path);
                    sendFile(file);
                });
                fileInput.click();
            });
            // 拖放文件
            document.body.querySelector('.ui-chat-main').addEventListener('drop', (e) => {
                e.preventDefault();
                e.stopPropagation();

                for (const file of e.dataTransfer.files) {
                    console.debug('拖放文件: ', file.path);
                    sendFile(file);
                }
            });
            document.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });

            // 发送文字
            const sendInputText = document.body.querySelector('#sendInputText');
            const sendText = document.body.querySelector('#sendText');
            sendText.addEventListener('click', () => {
                if (S.contactActive === null) {
                    return;
                }
                const text = sendInputText.value;
                if (text === '') {
                    return;
                }
                sendInputText.value = '';

                sendChatMessage(text, null);
            });
            sendInputText.addEventListener('keydown', e => {
                if (e.key.toLowerCase() === 'enter') {
                    sendText.click();
                }
            });

            getContact();
            feed();
        };

        // 获取设置
        const getOption = () => {
            fetch(`http://${host}/api1/option`)
                .then(resp => {
                    if (resp.status !== 200) {
                        alert(resp.status);
                        return;
                    }

                    resp.json()
                        .then(result => {
                            S.option = result;
                            console.debug(S.option);

                            if (S.option.name === '') {
                                S.showMyInfoEditor(
                                    () => {
                                        //更新界面
                                        initUI();
                                    },
                                    false
                                );
                            } else {
                                if (S.option.photo !== '') {
                                    S.option.photo_url = URL.createObjectURL(
                                        S.dataUrlToFile(`data:image/png;base64,${S.option.photo}`, '头像.png')
                                    );
                                } else {
                                    S.option.photo_url = 'img/dove.svg';
                                }

                                //更新界面
                                initUI();
                            }
                        });
                });
        };

        // 反复刷新状态
        const updateState = () => {
            const stateElement = document.body.querySelector('#state');
            setInterval(() => {
                fetch(`http://${host}/api1/state`)
                    .then(resp => {
                        if (resp.status !== 200) {
                            // alert(resp.status);
                            return;
                        }

                        resp.json()
                            .then(result => {
                                // console.debug(result);
                                stateElement.textContent = `节点数量：${result.peerCount}，连接数量：${result.connCount}`;
                            });
                    });
            }, 6000);
        };

        // 获取节点ID
        const getID = () => {
            fetch(`http://${host}/api1/id`)
                .then(resp => {
                    if (resp.status === 200) {
                        resp.text()
                            .then(result => {
                                S.id = result;
                                getOption();
                                updateState();
                            });
                    } else {
                        window.setTimeout(getID, 500);
                    }
                })
                .catch(error => {
                    console.warn(error);
                    window.setTimeout(getID, 1000);
                });
        };
        getID();

        // 获取网址
        S.api.dnsTxt('website.pl.app.lilu.red')
            .then(txt => {
                S.website = txt;

                //
                // 获取版本
                S.api.dnsTxt('desktop-version_name.pl.app.lilu.red')
                    .then(txt => {
                        S.onlineVersionName = txt;
                        if (S.onlineVersionName !== S.versionName) {
                            S.showAppInfoWindow();
                        }
                    })
                    .catch(error => {
                        console.warn('获取版本失败', error);
                    });
                //
            })
            .catch(error => {
                console.warn('获取网址失败', error);
            });
        // 获取闪屏网址
        S.api.dnsTxt('desktop-flash.pl.app.lilu.red')
            .then(txt => {
                document.body.querySelector('.ui-chat-main-tips').innerHTML = `<iframe src="${txt}"></iframe>`;
            })
            .catch(error => {
                console.warn('获取网址失败', error);
            });
    }
};