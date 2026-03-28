// core.js — Omega Painel: estrutura base (v57 — refatorado)
(function(){
  if(document.getElementById('antt-helper'))return;

  window.OmegaJQ  = unsafeWindow.jQuery || unsafeWindow.$;
  window.OmegaMom = unsafeWindow.moment;

  // ── Salva setTimeout nativo ANTES de qualquer coisa ─────────────
  window._setTimeoutNativo = unsafeWindow.setTimeout.bind(unsafeWindow);
  window._omegaAutomacaoAtiva = false;

  // ── Helper global: setTimeout seguro ────────────────────────────
  window.ST = function(fn, ms){
    return window._setTimeoutNativo ? window._setTimeoutNativo(fn, ms) : setTimeout(fn, ms);
  };

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
    +'<span id="omega-minimizar" onclick="OmegaMinimizar()" style="position:absolute;top:12px;right:36px;cursor:pointer;font-size:16px;color:#aaa;user-select:none">—</span>'
    +'<div id="omega-tabs" style="display:grid;gap:4px;margin-bottom:10px"></div>'
    +'<div id="omega-content"></div>'
    +'<hr style="margin:10px 0;border:none;border-top:1px solid #eee">'
    +'<div style="display:flex;align-items:center;gap:6px">'
      +'<span style="font-size:10px;color:#aaa;flex:1" id="omega-api-status"></span>'
      +'<button onclick="OmegaConfigAPI()" style="padding:4px 8px;background:#f1f3f4;border:none;border-radius:5px;font-size:10px;color:#555;cursor:pointer">Chave API</button>'
    +'</div>';
  document.body.appendChild(s);

  // ── Sistema de abas unificado ───────────────────────────────────
  window._OmegaAbas = [];

  unsafeWindow.OmegaAba = function(abaId) {
    document.querySelectorAll('#omega-tabs button').forEach(function(btn){
      var ativo = btn.getAttribute('data-aba') === abaId;
      btn.style.background = ativo ? '#1a73e8' : '#e8f0fe';
      btn.style.color      = ativo ? '#fff'    : '#1a73e8';
    });
    document.querySelectorAll('#omega-content > [data-aba-content]').forEach(function(el){
      el.style.display = el.getAttribute('data-aba-content') === abaId ? 'block' : 'none';
    });
    if(window._OmegaAbaCallbacks && window._OmegaAbaCallbacks[abaId]){
      window._OmegaAbaCallbacks[abaId]();
    }
  };

  // ── Utilitários globais ─────────────────────────────────────────
  window.OmegaUtils = {

    // ── UI helpers ──────────────────────────────────────────────
    box: function(el,ok,msg){
      if(!el)return;
      el.style.cssText='margin-top:6px;font-size:11px;border-radius:6px;padding:7px 10px;background:'+(ok?'#e6f4ea':'#fce8e6')+';color:'+(ok?'#1e7e34':'#c0392b')+';border:1px solid '+(ok?'#a8d5b5':'#f1a9a0');
      el.innerHTML=msg;
    },

    clearBox: function(el){ if(el){ el.style.cssText=''; el.innerHTML=''; } },

    // ── Formatacao CPF/CNPJ ─────────────────────────────────────
    fCPF:  function(n){ return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4'); },
    fCNPJ: function(n){ return n.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,'$1.$2.$3/$4-$5'); },
    fAuto: function(n){ return n.length===11 ? this.fCPF(n) : this.fCNPJ(n); },

    // ── Validacao de placa (antiga e Mercosul) ──────────────────
    validarPlaca: function(raw) {
      var p = raw.replace(/[^A-Z0-9]/g,'').toUpperCase();
      if(p.length !== 7) return null;
      if(/^[A-Z]{3}[0-9]{4}$/.test(p)) return p;           // antiga
      if(/^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(p)) return p; // Mercosul
      return null;
    },

    // ── Formatar placa para display ─────────────────────────────
    formatarPlaca: function(p) {
      if(!p) return '';
      return /^[A-Z]{3}[0-9]{4}$/.test(p) ? p.substring(0,3)+'-'+p.substring(3) : p;
    },

    // ── Leitura do DOM ──────────────────────────────────────────
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

    // ── Substituicao global no DOM ──────────────────────────────
    substituirTudo: function(antigo,novo){
      if(!antigo||!novo)return{total:0};
      function tr(t){return(!t||typeof t!=='string')?t:t.replaceAll(antigo,novo);}
      var ta=0,tv=0,tt=0;
      document.querySelectorAll('*').forEach(function(el){
        for(var i=0;i<el.attributes.length;i++){
          var a=el.attributes[i];
          if(a.value.includes(antigo)){var b=a.value;a.value=tr(a.value);if(a.value!==b)ta++;}
        }
        if(typeof el.value==='string'&&el.value.includes(antigo)){var b=el.value;el.value=tr(el.value);if(el.value!==b)tv++;}
      });
      var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
      var nd;while(nd=w.nextNode()){if(nd.nodeValue.includes(antigo)){var b=nd.nodeValue;nd.nodeValue=tr(nd.nodeValue);if(nd.nodeValue!==b)tt++;}}
      return{atributos:ta,values:tv,textos:tt,total:ta+tv+tt};
    },

    // ── Injecao de data em DateTimePicker ────────────────────────
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

    // ── Registrar aba no painel ─────────────────────────────────
    registrarAba: function(id, label, html, onShow) {
      var tabsDiv    = document.getElementById('omega-tabs');
      var contentDiv = document.getElementById('omega-content');

      var btn = document.createElement('button');
      btn.setAttribute('data-aba', id);
      btn.textContent = label;
      btn.style.cssText = 'padding:7px;background:#e8f0fe;color:#1a73e8;border:none;border-radius:7px;font-size:12px;cursor:pointer;font-weight:bold';
      btn.onclick = function(){ OmegaAba(id); };
      tabsDiv.appendChild(btn);

      var total = tabsDiv.children.length;
      tabsDiv.style.gridTemplateColumns = 'repeat('+total+', 1fr)';

      var div = document.createElement('div');
      div.setAttribute('data-aba-content', id);
      div.style.display = 'none';
      div.innerHTML = html;
      contentDiv.appendChild(div);

      if(onShow){
        if(!window._OmegaAbaCallbacks) window._OmegaAbaCallbacks = {};
        window._OmegaAbaCallbacks[id] = onShow;
      }

      if(total === 1) OmegaAba(id);
    },

    addSecao: function(html){
      document.getElementById('omega-content').insertAdjacentHTML('beforeend', html);
    },

    // ── API Key ─────────────────────────────────────────────────
    getApiKey: function(){
      return (typeof GM_getValue !== 'undefined') ? GM_getValue('omega_api_key','') : localStorage.getItem('omega_api_key')||'';
    },
    setApiKey: function(key){
      if(typeof GM_setValue !== 'undefined') GM_setValue('omega_api_key',key);
      else localStorage.setItem('omega_api_key',key);
    },

    // ══════════════════════════════════════════════════════════════
    // HELPERS DE AUTOMACAO — consolidados aqui para reuso
    // ══════════════════════════════════════════════════════════════

    // ── Matar timers do portal + fechar toasts ──────────────────
    matarTimers: function(){
      try{
        var idRef = unsafeWindow.setTimeout(function(){},1);
        unsafeWindow.clearTimeout(idRef);
        for(var i=idRef; i>Math.max(0,idRef-500); i--){
          unsafeWindow.clearInterval(i);
          unsafeWindow.clearTimeout(i);
        }
      }catch(e){}
      // Fecha toasts visiveis
      document.querySelectorAll('.toast-close-button').forEach(function(btn){ try{btn.click();}catch(e){} });
    },

    // ── Polling generico ────────────────────────────────────────
    // condicaoFn(): retorna truthy quando pronto
    // acaoFn(resultado): chamado quando condicao atendida
    // opts: { maxTentativas:40, intervalo:200, onTimeout:fn }
    poll: function(condicaoFn, acaoFn, opts) {
      opts = opts || {};
      var max  = opts.maxTentativas || 40;
      var ms   = opts.intervalo || 200;
      var tent = 0;
      function check(){
        tent++;
        var resultado = condicaoFn();
        if(resultado){
          acaoFn(resultado);
        } else if(tent < max){
          ST(check, ms);
        } else if(opts.onTimeout){
          opts.onTimeout();
        }
      }
      check();
    },

    // ── Digitar texto char a char (simula usuario) ──────────────
    // campo: element, texto: string
    // opts: {delay:80, delayEspecial:{4:150}, onDone:fn, skipFinais:bool}
    // skipFinais=true: nao dispara change/blur ao final (caller cuida)
    digitarCharAChar: function(campo, texto, opts) {
      opts = opts || {};
      var delay = opts.delay || 80;
      var delayEspecial = opts.delayEspecial || {};
      campo.value = '';
      campo.focus();
      campo.click();
      campo.dispatchEvent(new Event('focus',{bubbles:true}));
      var i = 0;
      function prox(){
        if(i >= texto.length){
          if(!opts.skipFinais){
            campo.dispatchEvent(new Event('change',{bubbles:true}));
            campo.dispatchEvent(new Event('blur',{bubbles:true}));
          }
          if(opts.onDone) ST(opts.onDone, opts.skipFinais ? 0 : 200);
          return;
        }
        var ch = texto[i];
        campo.value = texto.substring(0, i+1);
        campo.dispatchEvent(new Event('input',{bubbles:true}));
        campo.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,cancelable:true,key:ch}));
        i++;
        ST(prox, delayEspecial[i] || delay);
      }
      prox();
    },

    // ── Marcar checkbox iCheck ──────────────────────────────────
    marcarICheck: function(cb) {
      if(!cb) return;
      var jqR = unsafeWindow.jQuery || unsafeWindow.$;
      try{ jqR(cb).iCheck('check'); }catch(e){}
      cb.checked = true;
      jqR(cb).trigger('ifChecked').trigger('change');
    },

    // ── Fechar modal Bootstrap ──────────────────────────────────
    fecharModal: function() {
      var btnFechar = document.querySelector('.modal.show .close, .modal.show [data-dismiss="modal"]');
      if(btnFechar) btnFechar.click();
      ST(function(){
        document.querySelectorAll('.modal-backdrop').forEach(function(el){ el.remove(); });
        document.body.classList.remove('modal-open');
      }, 300);
    },

    // ── Guard anti-duplo-clique ─────────────────────────────────
    // Retorna true se PODE clicar (e seta a flag). False se ja clicado.
    guardClique: function(el, tempoMs) {
      if(!el) return false;
      if(el._omegaClicado) return false;
      el._omegaClicado = true;
      ST(function(){ el._omegaClicado = false; }, tempoMs || 10000);
      return true;
    },

    // ── Historico de veiculos (compartilhado entre modulos) ─────
    HIST_KEY: 'omega_historico',
    HIST_TTL: 86400000,

    carregarHistorico: function(){
      try{
        var raw = (typeof GM_getValue !== 'undefined') ? GM_getValue(this.HIST_KEY,'[]') : localStorage.getItem(this.HIST_KEY)||'[]';
        var self = this;
        return JSON.parse(raw).filter(function(i){ return (Date.now()-i.ts) < self.HIST_TTL; });
      }catch(e){ return []; }
    },

    salvarHistorico: function(lista){
      var raw = JSON.stringify(lista);
      if(typeof GM_setValue !== 'undefined') GM_setValue(this.HIST_KEY, raw);
      else localStorage.setItem(this.HIST_KEY, raw);
    },

    adicionarHistorico: function(dados){
      var lista = this.carregarHistorico().filter(function(i){ return i.placa !== dados.placa; });
      lista.unshift({ placa:dados.placa, renavam:dados.renavam, cpf:dados.cpf, nome:dados.nome, ts:Date.now() });
      this.salvarHistorico(lista);
    },

    tempoRelativo: function(ts){
      var d=Date.now()-ts, min=Math.floor(d/60000), hrs=Math.floor(d/3600000);
      return min<1 ? 'agora' : min<60 ? 'ha '+min+'min' : 'ha '+hrs+'h';
    },

    // ── Parse de codigo pipe-separated ──────────────────────────
    parseCodigo: function(codigo){
      var dados = {};
      codigo.split('|').forEach(function(par){
        var idx = par.indexOf('=');
        if(idx !== -1) dados[par.substring(0,idx).trim()] = par.substring(idx+1).trim();
      });
      return dados;
    },

    // ── Gerar email aleatorio ───────────────────────────────────
    gerarEmail: function(){
      var c='abcdefghijklmnopqrstuvwxyz0123456789', s='';
      for(var i=0;i<12;i++) s+=c[Math.floor(Math.random()*c.length)];
      return s+'@yahoo.com';
    },

    // ── CEPs por estado ─────────────────────────────────────────
    CEPS: {
      MG: ['32220-390','32017-900','32280-370'],
      SP: ['04805-140','01002-900','08062-700'],
      RJ: ['23032-486','20211-110','22793-620']
    },

    cepAleatorio: function(estado){
      var l = this.CEPS[estado] || this.CEPS.MG;
      return l[Math.floor(Math.random()*l.length)];
    }
  };

  // Alias para compatibilidade
  window.OmegaMatarTimers = function(){ window.OmegaUtils.matarTimers(); };

  // ── Proteção contra reload durante automação ────────────────────
  unsafeWindow.addEventListener('beforeunload', function(e){
    if(window._omegaAutomacaoAtiva){
      e.preventDefault(); e.returnValue=''; return '';
    }
  }, true);

  // ── Minimizar/restaurar painel ──────────────────────────────────
  unsafeWindow.OmegaMinimizar = function(){
    var painel = document.getElementById('antt-helper');
    var conteudo = document.getElementById('omega-tabs');
    var content = document.getElementById('omega-content');
    var hr = painel.querySelector('hr');
    var rodape = painel.querySelector('div[style*="align-items:center"]');
    var btnMin = document.getElementById('omega-minimizar');
    var minimizado = painel.getAttribute('data-minimizado') === '1';
    var els = [conteudo, content, hr, rodape];
    if(minimizado){
      els.forEach(function(el){ if(el) el.style.display=''; });
      painel.style.width='440px';
      painel.setAttribute('data-minimizado','0');
      if(btnMin) btnMin.textContent='—';
    } else {
      els.forEach(function(el){ if(el) el.style.display='none'; });
      painel.style.width='160px';
      painel.setAttribute('data-minimizado','1');
      if(btnMin) btnMin.textContent='▢';
    }
  };

  // ── Configuracao da API ─────────────────────────────────────────
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
