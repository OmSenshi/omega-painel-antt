// ==UserScript==
// @name         Omega Painel - ANTT
// @namespace    antt-omega
// @version      2.5
// @description  Painel de automacao para contratos de arrendamento ANTT
// @match        https://rntrcdigital.antt.gov.br/ContratoArrendamento/Criar
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==

(function(){
  if(document.getElementById('antt-helper'))return;

  var jq  = unsafeWindow.jQuery || unsafeWindow.$;
  var mom = unsafeWindow.moment;

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
    +'<label style="font-size:12px;color:#555">CPF ou CNPJ:</label>'
    +'<input id="antt-cpf-input" placeholder="000.000.000-00 ou 00.000.000/0000-00" style="width:100%;margin-top:6px;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box">'
    +'<div id="antt-preview" style="margin-top:8px;font-size:12px;color:#666;min-height:16px"></div>'
    +'<button id="antt-btn" style="width:100%;margin-top:10px;padding:10px;background:#1a73e8;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;font-weight:bold">Substituir na Pagina</button>'
    +'<div id="antt-status" style="margin-top:10px;font-size:12px;min-height:16px;border-radius:8px;padding:0"></div>'
    +'<hr style="margin:14px 0;border:none;border-top:1px solid #eee">'
    +'<label style="font-size:12px;color:#555">Nome do Arrendante:</label>'
    +'<input id="antt-nome-input" placeholder="Ex: Joao da Silva" style="width:100%;margin-top:6px;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box">'
    +'<div id="antt-nome-preview" style="margin-top:6px;font-size:12px;color:#666;min-height:16px"></div>'
    +'<button id="antt-nome-btn" style="width:100%;margin-top:10px;padding:10px;background:#1a73e8;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;font-weight:bold">Substituir Nome</button>'
    +'<div id="antt-nome-status" style="margin-top:10px;font-size:12px;min-height:16px;border-radius:8px;padding:0"></div>'
    +'<hr style="margin:14px 0;border:none;border-top:1px solid #eee">'
    +'<button id="antt-data-btn" style="width:100%;padding:10px;background:#34a853;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;font-weight:bold">Preencher Data</button>'
    +'<div id="antt-data-status" style="margin-top:10px;font-size:12px;min-height:16px;border-radius:8px;padding:0"></div>'
    +'<hr style="margin:14px 0;border:none;border-top:1px solid #eee">'
    +'<button id="antt-check-btn" style="width:100%;padding:10px;background:#6f42c1;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;font-weight:bold">Marcar Declaracoes</button>'
    +'<div id="antt-check-status" style="margin-top:10px;font-size:12px;min-height:16px;border-radius:8px;padding:0"></div>';

  document.body.appendChild(s);

  function fCPF(n){return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4');}
  function fCNPJ(n){return n.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,'$1.$2.$3/$4-$5');}
  function fAuto(n){return n.length===11?fCPF(n):fCNPJ(n);}
  function box(el,ok,msg){el.style.cssText='margin-top:10px;font-size:12px;border-radius:8px;padding:10px 12px;background:'+(ok?'#e6f4ea':'#fce8e6')+';color:'+(ok?'#1e7e34':'#c0392b')+';border:1px solid '+(ok?'#a8d5b5':'#f1a9a0');el.innerHTML=msg;}
  function getDoc(){var sel=document.getElementById('CPFCNPJArrendanteTransportador');if(sel&&sel.value)return sel.value.replace(/\D/g,'');var hid=document.getElementById('CPFCNPJArrendante');if(hid&&hid.value)return hid.value.replace(/\D/g,'');var m=document.body.innerHTML.match(/value="(\d{11,14})"/);return m?m[1]:null;}
  function getNome(){var h=document.getElementById('NomeArrendante');if(h&&h.value)return h.value.trim();var n=document.getElementById('NomesTransportador');if(n&&n.value){try{var a=JSON.parse(n.value);if(a&&a[0]&&a[0].Nome)return a[0].Nome.trim();}catch(e){}}var m=document.body.innerHTML.match(/Bem-vindo\(a\),\s*<i>([^<]+)<\/i>/);return m?m[1].trim():null;}

  function injetarData(divId, valor) {
    // O id fica no DIV wrapper, nao no input — pega o input filho
    var divWrapper = jq('#' + divId);
    var inputEl = divWrapper.find('input').first();

    if(!inputEl.length) return false;

    // Libera o campo
    inputEl.removeAttr('disabled').removeAttr('readonly');

    // Tenta via DateTimePicker no DIV wrapper (onde o plugin e inicializado)
    try {
      var dp = divWrapper.data('DateTimePicker');
      if(dp) {
        dp.date(mom(valor, 'DD/MM/YYYY'));
        return true;
      }
    } catch(e) {}

    // Tenta inicializar o plugin no wrapper e setar
    try {
      divWrapper.datetimepicker({ format: 'DD/MM/YYYY' });
      divWrapper.data('DateTimePicker').date(mom(valor, 'DD/MM/YYYY'));
      return true;
    } catch(e) {}

    // Fallback: seta direto no input e dispara todos os eventos
    inputEl.val(valor);
    inputEl.trigger('input').trigger('change').trigger('blur').trigger('dp.change');
    divWrapper.trigger('dp.change').trigger('change');
    return inputEl.val() === valor;
  }

  var inp=document.getElementById('antt-cpf-input');
  inp.addEventListener('input',function(){var r=this.value.replace(/\D/g,''),p=document.getElementById('antt-preview');if(r.length===11)p.innerHTML='<span style="color:green">CPF: <b>'+fCPF(r)+'</b></span>';else if(r.length===14)p.innerHTML='<span style="color:green">CNPJ: <b>'+fCNPJ(r)+'</b></span>';else if(r.length>0)p.innerHTML='<span style="color:orange">'+r.length+' digitos</span>';else p.textContent='';});

  document.getElementById('antt-btn').addEventListener('click',function(){
    var st=document.getElementById('antt-status'),raw=inp.value.replace(/\D/g,'');
    if(!raw)return box(st,false,'Nenhum valor digitado.');
    if(raw.length!==11&&raw.length!==14)return box(st,false,raw.length+' digitos. CPF=11, CNPJ=14.');
    var nf=fAuto(raw),ap=getDoc();
    if(!ap)return box(st,false,'CPF/CNPJ nao encontrado na pagina.');
    var af=fAuto(ap);
    function tr(t){return(!t||typeof t!=='string')?t:t.replaceAll(af,nf).replaceAll(ap,raw);}
    var ta=0,tv=0,tt=0;
    document.querySelectorAll('*').forEach(function(el){for(var i=0;i<el.attributes.length;i++){var a=el.attributes[i];if(a.value.includes(ap)||a.value.includes(af)){var b=a.value;a.value=tr(a.value);if(a.value!==b)ta++;}}if(typeof el.value==='string'&&(el.value.includes(ap)||el.value.includes(af))){var b=el.value;el.value=tr(el.value);if(el.value!==b)tv++;}});
    var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);var nd;while(nd=w.nextNode()){if(nd.nodeValue.includes(ap)||nd.nodeValue.includes(af)){var b=nd.nodeValue;nd.nodeValue=tr(nd.nodeValue);if(nd.nodeValue!==b)tt++;}}
    var tot=ta+tv+tt;
    if(tot===0)box(st,false,'Nenhuma ocorrencia de <b>'+af+'</b> encontrada.');
    else box(st,true,'Substituido! <b>'+nf+'</b><br><span style="color:#555;font-size:11px">Atributos: '+ta+' | Values: '+tv+' | Textos: '+tt+' (total: '+tot+')</span>');
    inp.value='';document.getElementById('antt-preview').textContent='';
  });

  var ni=document.getElementById('antt-nome-input');
  ni.addEventListener('input',function(){var p=document.getElementById('antt-nome-preview'),v=this.value.trim();if(v)p.innerHTML='<span style="color:green">Sera: <b>'+v.toUpperCase()+'</b></span>';else p.textContent='';});

  document.getElementById('antt-nome-btn').addEventListener('click',function(){
    var st=document.getElementById('antt-nome-status'),nn=ni.value.trim().toUpperCase();
    if(!nn)return box(st,false,'Nenhum nome digitado.');
    var an=getNome();
    if(!an)return box(st,false,'Nome nao encontrado na pagina.');
    function tr(t){return(!t||typeof t!=='string')?t:t.replaceAll(an,nn);}
    var ta=0,tv=0,tt=0;
    document.querySelectorAll('*').forEach(function(el){for(var i=0;i<el.attributes.length;i++){var a=el.attributes[i];if(a.value.includes(an)){var b=a.value;a.value=tr(a.value);if(a.value!==b)ta++;}}if(typeof el.value==='string'&&el.value.includes(an)){var b=el.value;el.value=tr(el.value);if(el.value!==b)tv++;}});
    var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);var nd;while(nd=w.nextNode()){if(nd.nodeValue.includes(an)){var b=nd.nodeValue;nd.nodeValue=tr(nd.nodeValue);if(nd.nodeValue!==b)tt++;}}
    var cv=document.getElementById('NomeArrendanteInput');
    if(cv){cv.removeAttribute('disabled');cv.value=nn;cv.setAttribute('disabled','disabled');}
    var tot=ta+tv+tt;
    if(tot===0&&!cv)box(st,false,'Nome <b>'+an+'</b> nao encontrado.');
    else box(st,true,'Nome substituido! <b>'+nn+'</b><br><span style="color:#555;font-size:11px">Atributos: '+ta+' | Values: '+tv+' | Textos: '+tt+' (total: '+tot+')</span>');
    ni.value='';document.getElementById('antt-nome-preview').textContent='';
  });

  document.getElementById('antt-data-btn').addEventListener('click',function(){
    var ds=document.getElementById('antt-data-status');
    if(!jq||!mom)return box(ds,false,'jQuery ou moment.js nao encontrados.');
    var hj=new Date();
    var dd=String(hj.getDate()).padStart(2,'0');
    var mm=String(hj.getMonth()+1).padStart(2,'0');
    var yy=hj.getFullYear();
    var di=dd+'/'+mm+'/'+yy;
    var fim=new Date(hj);
    fim.setFullYear(fim.getFullYear()+1);
    var df=String(fim.getDate()).padStart(2,'0')+'/'+String(fim.getMonth()+1).padStart(2,'0')+'/'+fim.getFullYear();

    injetarData('DataInicio', di);
    injetarData('DataFim', df);

    setTimeout(function(){
      var viInicio = jq('#DataInicio').find('input').first().val();
      var viFim    = jq('#DataFim').find('input').first().val();
      if(viInicio===di && viFim===df){
        box(ds,true,'Datas preenchidas!<br><span style="font-size:11px;color:#555">Inicio: <b>'+di+'</b> | Fim: <b>'+df+'</b></span>');
      } else if(!viInicio && !viFim){
        box(ds,false,'Clique em <b>Verificar</b> o veiculo primeiro.');
      } else {
        box(ds,false,'Parcial — Inicio: <b>'+(viInicio||'vazio')+'</b> | Fim: <b>'+(viFim||'vazio')+'</b>');
      }
    },400);
  });

  document.getElementById('antt-check-btn').addEventListener('click',function(){
    var st=document.getElementById('antt-check-status');
    var c1=document.getElementById('ExisteContrato');
    var c2=document.getElementById('InformacoesVerdadeiras');
    var erros=[];
    if(!c1)erros.push('ExisteContrato');
    if(!c2)erros.push('InformacoesVerdadeiras');
    if(erros.length>0)return box(st,false,'Campos nao encontrados: '+erros.join(', '));
    function marcar(cb){cb.checked=true;cb.dispatchEvent(new Event('change',{bubbles:true}));cb.dispatchEvent(new Event('click',{bubbles:true}));}
    marcar(c1);marcar(c2);
    if(c1.checked&&c2.checked)box(st,true,'Declaracoes marcadas!<br><span style="font-size:11px;color:#555">Existe Contrato: marcado | Informacoes Verdadeiras: marcado</span>');
    else box(st,false,'Erro ao marcar os checkboxes.');
  });

  inp.focus();
})();
