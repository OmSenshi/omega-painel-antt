// core.js — Omega Painel: estrutura base do painel
(function(){
  if(document.getElementById('antt-helper'))return;

  window.OmegaJQ  = unsafeWindow.jQuery || unsafeWindow.$;
  window.OmegaMom = unsafeWindow.moment;

  // ── Monta o painel vazio ────────────────────────────────────────────────
  var s=document.createElement('div');
  s.id='antt-helper';
  s.style.cssText='position:fixed;top:20px;right:20px;z-index:999999;background:#fff;border:2px solid #1a73e8;border-radius:12px;padding:20px;box-shadow:0 4px 20px rgba(0,0,0,0.2);font-family:Arial,sans-serif;min-width:310px;';
  s.innerHTML=''
    +'<div style="text-align:center;margin-bottom:4px">'
    +'<div style="font-size:20px;font-weight:bold;color:#1a73e8;letter-spacing:2px">OMEGA</div>'
    +'<div style="font-size:10px;color:#888;margin-top:1px;letter-spacing:1px">Painel</div>'
    +'</div>'
    +'<div style="display:flex;justify-content:flex-end;margin-bottom:8px">'
    +'<span onclick=document.getElementById("antt-helper").remove() style="cursor:pointer;font-size:18px;color:#999;line-height:1">X</span>'
    +'</div>'
    +'<hr style="margin:0 0 14px;border:none;border-top:1px solid #eee">'
    +'<div id="omega-content"></div>';
  document.body.appendChild(s);

  // ── Utilitários globais disponíveis para todos os módulos ───────────────
  window.OmegaUtils = {

    box: function(el,ok,msg){
      el.style.cssText='margin-top:10px;font-size:12px;border-radius:8px;padding:10px 12px;background:'+(ok?'#e6f4ea':'#fce8e6')+';color:'+(ok?'#1e7e34':'#c0392b')+';border:1px solid '+(ok?'#a8d5b5':'#f1a9a0');
      el.innerHTML=msg;
    },

    fCPF: function(n){return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4');},
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

    substituirTudo: function(antigo, novo){
      function tr(t){return(!t||typeof t!=='string')?t:t.replaceAll(antigo,novo);}
      var ta=0,tv=0,tt=0;
      document.querySelectorAll('*').forEach(function(el){
        for(var i=0;i<el.attributes.length;i++){var a=el.attributes[i];if(a.value.includes(antigo)){var b=a.value;a.value=tr(a.value);if(a.value!==b)ta++;}}
        if(typeof el.value==='string'&&el.value.includes(antigo)){var b=el.value;el.value=tr(el.value);if(el.value!==b)tv++;}
      });
      var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
      var nd;
      while(nd=w.nextNode()){if(nd.nodeValue.includes(antigo)){var b=nd.nodeValue;nd.nodeValue=tr(nd.nodeValue);if(nd.nodeValue!==b)tt++;}}
      return {atributos:ta,values:tv,textos:tt,total:ta+tv+tt};
    },

    injetarData: function(divId, valor){
      var jq=window.OmegaJQ, mom=window.OmegaMom;
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

    // Adiciona uma secao de botoes/campos ao painel
    addSecao: function(html){
      document.getElementById('omega-content').insertAdjacentHTML('beforeend', html);
    }
  };

})();
