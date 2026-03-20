// core.js — Omega Painel: estrutura base
(function(){
  if(document.getElementById('antt-helper'))return;

  window.OmegaJQ  = unsafeWindow.jQuery || unsafeWindow.$;
  window.OmegaMom = unsafeWindow.moment;

  // ── Painel principal ────────────────────────────────────────────
  var s = document.createElement('div');
  s.id = 'antt-helper';
  s.style.cssText = 'position:fixed;top:20px;right:20px;z-index:999999;background:#fff;border:2px solid #1a73e8;border-radius:12px;padding:14px;box-shadow:0 4px 20px rgba(0,0,0,0.2);font-family:Arial,sans-serif;width:440px;';
  s.innerHTML = ''
    +'<div style="text-align:center;margin-bottom:8px">'
      +'<div style="font-size:20px;font-weight:bold;color:#1a73e8;letter-spacing:2px">OMEGA</div>'
      +'<div style="font-size:10px;color:#888;letter-spacing:1px">Painel</div>'
    +'</div>'
    +'<span onclick="document.getElementById(\'antt-helper\').remove()" style="position:absolute;top:12px;right:14px;cursor:pointer;font-size:16px;color:#aaa">✕</span>'
    // Abas unificadas — preenchidas pelos modulos
    +'<div id="omega-tabs" style="display:grid;gap:4px;margin-bottom:10px"></div>'
    // Conteudo das abas
    +'<div id="omega-content"></div>'
    // Rodape API
    +'<hr style="margin:10px 0;border:none;border-top:1px solid #eee">'
    +'<div style="display:flex;align-items:center;gap:6px">'
      +'<span style="font-size:10px;color:#aaa;flex:1" id="omega-api-status"></span>'
      +'<button onclick="OmegaConfigAPI()" style="padding:4px 8px;background:#f1f3f4;border:none;border-radius:5px;font-size:10px;color:#555;cursor:pointer">Chave API</button>'
    +'</div>';
  document.body.appendChild(s);

  // ── Sistema de abas unificado ───────────────────────────────────
  // Cada modulo registra suas abas via OmegaUtils.registrarAba(id, label, buildFn)
  // buildFn() deve retornar o HTML da aba
  window._OmegaAbas = []; // { id, label, buildFn }

  unsafeWindow.OmegaAba = function(abaId) {
    // Atualiza botoes
    document.querySelectorAll('#omega-tabs button').forEach(function(btn){
      var ativo = btn.getAttribute('data-aba') === abaId;
      btn.style.background = ativo ? '#1a73e8' : '#e8f0fe';
      btn.style.color      = ativo ? '#fff'    : '#1a73e8';
    });
    // Mostra/oculta conteudo
    document.querySelectorAll('#omega-content > [data-aba-content]').forEach(function(el){
      el.style.display = el.getAttribute('data-aba-content') === abaId ? 'block' : 'none';
    });
    // Callback pos-troca se existir
    if(window._OmegaAbaCallbacks && window._OmegaAbaCallbacks[abaId]){
      window._OmegaAbaCallbacks[abaId]();
    }
  };

  // ── Utilitários globais ─────────────────────────────────────────
  window.OmegaUtils = {

    box: function(el,ok,msg){
      if(!el)return;
      el.style.cssText='margin-top:6px;font-size:11px;border-radius:6px;padding:7px 10px;background:'+(ok?'#e6f4ea':'#fce8e6')+';color:'+(ok?'#1e7e34':'#c0392b')+';border:1px solid '+(ok?'#a8d5b5':'#f1a9a0');
      el.innerHTML=msg;
    },

    clearBox: function(el){ if(el){ el.style.cssText=''; el.innerHTML=''; } },

    fCPF:  function(n){return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4');},
    fCNPJ: function(n){return n.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,'$1.$2.$3/$4-$5');},
    fAuto: function(n){return n.length===11?this.fCPF(n):this.fCNPJ(n);},

    getDoc: function(){
      var sel=document.getElementById('CPFCNPJArrendanteTransportador');
      if(sel&&sel.value)return sel.value.replace(/\D/g,'');
      var hid=document.getElementById('CPFCNPJArrendante');
      if(hid&&hid.value)return hid.value.replace(/\D/g,'');
      var m=document.body.innerHTML.match(/value="(\d{11,14})"/);
      return m?m[1]:null;
    },

    getNome: function(){
      var h=document.getElementById('NomeArrendante');
      if(h&&h.value)return h.value.trim();
      var n=document.getElementById('NomesTransportador');
      if(n&&n.value){try{var a=JSON.parse(n.value);if(a&&a[0]&&a[0].Nome)return a[0].Nome.trim();}catch(e){}}
      var m=document.body.innerHTML.match(/Bem-vindo\(a\),\s*<i>([^<]+)<\/i>/);
      return m?m[1].trim():null;
    },

    substituirTudo: function(antigo,novo){
      if(!antigo||!novo)return{total:0};
      function tr(t){return(!t||typeof t!=='string')?t:t.replaceAll(antigo,novo);}
      var ta=0,tv=0,tt=0;
      document.querySelectorAll('*').forEach(function(el){
        for(var i=0;i<el.attributes.length;i++){var a=el.attributes[i];if(a.value.includes(antigo)){var b=a.value;a.value=tr(a.value);if(a.value!==b)ta++;}}
        if(typeof el.value==='string'&&el.value.includes(antigo)){var b=el.value;el.value=tr(el.value);if(el.value!==b)tv++;}
      });
      var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
      var nd;while(nd=w.nextNode()){if(nd.nodeValue.includes(antigo)){var b=nd.nodeValue;nd.nodeValue=tr(nd.nodeValue);if(nd.nodeValue!==b)tt++;}}
      return{atributos:ta,values:tv,textos:tt,total:ta+tv+tt};
    },

    injetarData: function(divId,valor){
      var jq=window.OmegaJQ,mom=window.OmegaMom;
      if(!jq||!mom)return false;
      var divWrapper=jq('#'+divId);
      var inputEl=divWrapper.find('input').first();
      if(!inputEl.length)return false;
      inputEl.removeAttr('disabled').removeAttr('readonly');
      try{var dp=divWrapper.data('DateTimePicker');if(dp){dp.date(mom(valor,'DD/MM/YYYY'));return true;}}catch(e){}
      try{divWrapper.datetimepicker({format:'DD/MM/YYYY'});divWrapper.data('DateTimePicker').date(mom(valor,'DD/MM/YYYY'));return true;}catch(e){}
      inputEl.val(valor);
      inputEl.trigger('input').trigger('change').trigger('blur').trigger('dp.change');
      divWrapper.trigger('dp.change').trigger('change');
      return inputEl.val()===valor;
    },

    // Registra uma aba no painel — chamado pelos modulos
    // id: string unica, label: texto do botao, html: conteudo, onShow: callback opcional
    registrarAba: function(id, label, html, onShow) {
      var tabsDiv    = document.getElementById('omega-tabs');
      var contentDiv = document.getElementById('omega-content');

      // Botao da aba
      var btn = document.createElement('button');
      btn.setAttribute('data-aba', id);
      btn.textContent = label;
      btn.style.cssText = 'padding:7px;background:#e8f0fe;color:#1a73e8;border:none;border-radius:7px;font-size:12px;cursor:pointer;font-weight:bold';
      btn.onclick = function(){ OmegaAba(id); };
      tabsDiv.appendChild(btn);

      // Ajusta grid conforme numero de abas
      var total = tabsDiv.children.length;
      tabsDiv.style.gridTemplateColumns = 'repeat('+total+', 1fr)';

      // Conteudo da aba
      var div = document.createElement('div');
      div.setAttribute('data-aba-content', id);
      div.style.display = 'none';
      div.innerHTML = html;
      contentDiv.appendChild(div);

      // Callback
      if(onShow){
        if(!window._OmegaAbaCallbacks) window._OmegaAbaCallbacks = {};
        window._OmegaAbaCallbacks[id] = onShow;
      }

      // Ativa a primeira aba automaticamente
      if(total === 1) OmegaAba(id);
    },

    // Mantido por compatibilidade — adiciona HTML dentro da aba ativa ou direto no content
    addSecao: function(html){
      document.getElementById('omega-content').insertAdjacentHTML('beforeend', html);
    },

    getApiKey: function(){
      return GM_getValue ? GM_getValue('omega_api_key','') : localStorage.getItem('omega_api_key')||'';
    },
    setApiKey: function(key){
      if(GM_setValue) GM_setValue('omega_api_key',key);
      else localStorage.setItem('omega_api_key',key);
    }
  };

  // ── Proteção contra reload durante automação ────────────────────
  window._omegaAutomacaoAtiva = false;
  window._omegaIntervals = []; // rastreia intervals criados pelo portal

  // Intercepta setInterval para rastrear todos os timers
  var _setIntervalOrig = unsafeWindow.setInterval;
  var _clearIntervalOrig = unsafeWindow.clearInterval;
  unsafeWindow.setInterval = function(fn, delay){
    var id = _setIntervalOrig.apply(this, arguments);
    window._omegaIntervals.push(id);
    return id;
  };

  // Função para matar todos os intervals ativos (cancela o toast/redirect)
  window.OmegaMatarTimers = function(){
    // Pega o ID mais alto atual e cancela os últimos 200
    var idMax = _setIntervalOrig(function(){}, 99999);
    _clearIntervalOrig(idMax);
    for(var i=idMax; i>idMax-200; i--){
      _clearIntervalOrig(i);
    }
    // Cancela também os rastreados
    window._omegaIntervals.forEach(function(id){ _clearIntervalOrig(id); });
    window._omegaIntervals = [];
  };

  // Bloqueia location.href durante automação
  var _locHref = Object.getOwnPropertyDescriptor(unsafeWindow.location.__proto__, 'href') ||
                 Object.getOwnPropertyDescriptor(unsafeWindow.location, 'href');
  try {
    Object.defineProperty(unsafeWindow.location, 'href', {
      get: _locHref ? _locHref.get : function(){ return document.URL; },
      set: function(v){
        if(window._omegaAutomacaoAtiva){
          console.log('[OMEGA] Redirect bloqueado:', v);
          return;
        }
        if(_locHref && _locHref.set) _locHref.set.call(this, v);
      },
      configurable: true
    });
  } catch(e){}

  // Bloqueia beforeunload
  unsafeWindow.addEventListener('beforeunload', function(e){
    if(window._omegaAutomacaoAtiva){
      e.preventDefault();
      e.returnValue = '';
      return '';
    }
  }, true);
  unsafeWindow.OmegaConfigAPI = function() {
    var atual = window.OmegaUtils.getApiKey();
    var nova  = prompt('Cole sua chave da API Anthropic (sk-ant-...):', atual ? '********' : '');
    if(nova && nova !== '********'){
      window.OmegaUtils.setApiKey(nova.trim());
      _atualizarStatusAPI();
    }
  };

  function _atualizarStatusAPI() {
    var el  = document.getElementById('omega-api-status');
    var key = window.OmegaUtils.getApiKey();
    if(el) el.textContent = key ? 'API configurada' : 'API nao configurada';
  }
  _atualizarStatusAPI();

})();
