// pages/arrendamento.js — modulo: Cadastrar Contrato de Arrendamento
(function(){
  var U   = window.OmegaUtils;
  var jq  = window.OmegaJQ;
  var mom = window.OmegaMom;

  U.addSecao(''
    // ── Secao 1: Transportador ────────────────────────────────────────
    +'<div style="font-size:11px;font-weight:bold;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Transportador</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
      +'<div>'
        +'<label style="font-size:11px;color:#888">CPF / CNPJ</label>'
        +'<input id="antt-cpf-input" placeholder="000.000.000-00" style="width:100%;margin-top:4px;padding:8px;border:1px solid #ddd;border-radius:8px;font-size:13px;box-sizing:border-box">'
        +'<div id="antt-preview" style="margin-top:4px;font-size:11px;color:#666;min-height:14px"></div>'
      +'</div>'
      +'<div>'
        +'<label style="font-size:11px;color:#888">Nome</label>'
        +'<input id="antt-nome-input" placeholder="Nome completo" style="width:100%;margin-top:4px;padding:8px;border:1px solid #ddd;border-radius:8px;font-size:13px;box-sizing:border-box">'
        +'<div id="antt-nome-preview" style="margin-top:4px;font-size:11px;color:#666;min-height:14px"></div>'
      +'</div>'
    +'</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">'
      +'<button id="antt-btn" style="padding:9px;background:#1a73e8;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;font-weight:bold">Substituir CPF</button>'
      +'<button id="antt-nome-btn" style="padding:9px;background:#1a73e8;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;font-weight:bold">Substituir Nome</button>'
    +'</div>'
    +'<div id="antt-status" style="font-size:11px;min-height:0;border-radius:8px;padding:0"></div>'
    +'<div id="antt-nome-status" style="font-size:11px;min-height:0;border-radius:8px;padding:0"></div>'

    // ── Secao 2: Veiculo ──────────────────────────────────────────────
    +'<hr style="margin:12px 0;border:none;border-top:1px solid #eee">'
    +'<div style="font-size:11px;font-weight:bold;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Veiculo</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
      +'<div>'
        +'<label style="font-size:11px;color:#888">Placa</label>'
        +'<input id="antt-placa-input" placeholder="ABC1234 ou ABC-1234" maxlength="8" style="width:100%;margin-top:4px;padding:8px;border:1px solid #ddd;border-radius:8px;font-size:13px;box-sizing:border-box;text-transform:uppercase">'
        +'<div id="antt-placa-preview" style="margin-top:4px;font-size:11px;color:#666;min-height:14px"></div>'
      +'</div>'
      +'<div>'
        +'<label style="font-size:11px;color:#888">Renavam</label>'
        +'<input id="antt-renavam-input" placeholder="00000000000" maxlength="15" style="width:100%;margin-top:4px;padding:8px;border:1px solid #ddd;border-radius:8px;font-size:13px;box-sizing:border-box">'
      +'</div>'
    +'</div>'
    +'<button id="antt-veiculo-btn" style="width:100%;margin-top:8px;padding:9px;background:#1a73e8;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;font-weight:bold">Preencher e Verificar</button>'
    +'<div id="antt-veiculo-status" style="font-size:11px;min-height:0;border-radius:8px;padding:0"></div>'

    // ── Secao 3: Contrato ─────────────────────────────────────────────
    +'<hr style="margin:12px 0;border:none;border-top:1px solid #eee">'
    +'<div style="font-size:11px;font-weight:bold;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Contrato</div>'
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
      +'<button id="antt-data-btn" style="padding:9px;background:#34a853;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;font-weight:bold">Preencher Data</button>'
      +'<button id="antt-check-btn" style="padding:9px;background:#6f42c1;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;font-weight:bold">Marcar Declaracoes</button>'
    +'</div>'
    +'<div id="antt-data-status" style="font-size:11px;min-height:0;border-radius:8px;padding:0"></div>'
    +'<div id="antt-check-status" style="font-size:11px;min-height:0;border-radius:8px;padding:0"></div>'
  );

  // ── Formatar placa ────────────────────────────────────────────────────
  // Mercosul: 3 letras + 1 num + 1 letra + 2 nums  → sem traco (ABC1D23)
  // Padrao:   3 letras + 4 nums                     → com traco (ABC-1234)
  function formatarPlaca(raw) {
    var p = raw.replace(/[^A-Z0-9]/g,'').toUpperCase();
    if(p.length !== 7) return null;
    var isMercosul = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(p);
    var isPadrao   = /^[A-Z]{3}[0-9]{4}$/.test(p);
    if(isMercosul) return p;           // ABC1D23 — sem traco
    if(isPadrao)   return p.substring(0,3)+'-'+p.substring(3); // ABC-1234
    return null;
  }

  // ── Preview placa ─────────────────────────────────────────────────────
  var placaInp = document.getElementById('antt-placa-input');
  placaInp.addEventListener('input', function(){
    var p  = document.getElementById('antt-placa-preview');
    var fmt = formatarPlaca(this.value);
    if(fmt) p.innerHTML = '<span style="color:green">'+fmt+'</span>';
    else if(this.value.replace(/[^A-Z0-9]/gi,'').length > 0)
      p.innerHTML = '<span style="color:orange">Placa invalida</span>';
    else p.textContent = '';
  });

  // ── CPF/CNPJ preview ──────────────────────────────────────────────────
  var inp=document.getElementById('antt-cpf-input');
  inp.addEventListener('input',function(){
    var r=this.value.replace(/\D/g,''),p=document.getElementById('antt-preview');
    if(r.length===11)p.innerHTML='<span style="color:green">'+U.fCPF(r)+'</span>';
    else if(r.length===14)p.innerHTML='<span style="color:green">'+U.fCNPJ(r)+'</span>';
    else if(r.length>0)p.innerHTML='<span style="color:orange">'+r.length+' digitos</span>';
    else p.textContent='';
  });

  // ── Nome preview ──────────────────────────────────────────────────────
  var ni=document.getElementById('antt-nome-input');
  ni.addEventListener('input',function(){
    var p=document.getElementById('antt-nome-preview'),v=this.value.trim();
    if(v)p.innerHTML='<span style="color:green">'+v.toUpperCase()+'</span>';
    else p.textContent='';
  });

  // ── Substituir CPF/CNPJ ───────────────────────────────────────────────
  document.getElementById('antt-btn').addEventListener('click',function(){
    var st=document.getElementById('antt-status');
    var raw=inp.value.replace(/\D/g,'');
    if(!raw)return U.box(st,false,'Nenhum valor digitado.');
    if(raw.length!==11&&raw.length!==14)return U.box(st,false,raw.length+' digitos. CPF=11, CNPJ=14.');
    var nf=U.fAuto(raw),ap=U.getDoc();
    if(!ap)return U.box(st,false,'CPF/CNPJ nao encontrado.');
    var af=U.fAuto(ap);
    var r1=U.substituirTudo(af,nf);
    var r2=U.substituirTudo(ap,raw);
    var tot=r1.total+r2.total;
    if(tot===0)U.box(st,false,'Nenhuma ocorrencia de <b>'+af+'</b>.');
    else U.box(st,true,'CPF/CNPJ substituido! <b>'+nf+'</b> ('+tot+' trocas)');
    inp.value='';
    document.getElementById('antt-preview').textContent='';
  });

  // ── Substituir Nome ───────────────────────────────────────────────────
  document.getElementById('antt-nome-btn').addEventListener('click',function(){
    var st=document.getElementById('antt-nome-status');
    var nn=ni.value.trim().toUpperCase();
    if(!nn)return U.box(st,false,'Nenhum nome digitado.');
    var an=U.getNome();
    if(!an)return U.box(st,false,'Nome nao encontrado na pagina.');
    var res=U.substituirTudo(an,nn);
    var cv=document.getElementById('NomeArrendanteInput');
    if(cv){cv.removeAttribute('disabled');cv.value=nn;cv.setAttribute('disabled','disabled');}
    if(res.total===0&&!cv)U.box(st,false,'Nome <b>'+an+'</b> nao encontrado.');
    else U.box(st,true,'Nome substituido! <b>'+nn+'</b> ('+res.total+' trocas)');
    ni.value='';
    document.getElementById('antt-nome-preview').textContent='';
  });

  // ── Preencher Placa + Renavam + Verificar ─────────────────────────────
  document.getElementById('antt-veiculo-btn').addEventListener('click',function(){
    var st = document.getElementById('antt-veiculo-status');
    var placaRaw   = document.getElementById('antt-placa-input').value;
    var renavamRaw = document.getElementById('antt-renavam-input').value.trim();
    var placaFmt   = formatarPlaca(placaRaw);

    if(!placaFmt) return U.box(st,false,'Placa invalida. Use AAA-0000 ou AAA0A00.');
    if(!renavamRaw) return U.box(st,false,'Preencha o Renavam.');

    var campoPlaca   = document.getElementById('Placa');
    var campoRenavam = document.getElementById('Renavam');
    var btnVerificar = document.getElementById('verificar');

    if(!campoPlaca||!campoRenavam) return U.box(st,false,'Campos nao encontrados na pagina.');
    if(!btnVerificar) return U.box(st,false,'Botao Verificar nao encontrado.');

    // Simula digitacao caractere a caractere para respeitar a mascara do portal
    function simularDigitacao(el, valor) {
      el.removeAttribute('disabled');
      el.focus();
      el.value = '';
      el.dispatchEvent(new Event('focus', {bubbles:true}));
      for(var i=0; i<valor.length; i++) {
        el.value += valor[i];
        el.dispatchEvent(new KeyboardEvent('keydown',  {bubbles:true, key: valor[i]}));
        el.dispatchEvent(new KeyboardEvent('keypress', {bubbles:true, key: valor[i]}));
        el.dispatchEvent(new Event('input',  {bubbles:true}));
        el.dispatchEvent(new KeyboardEvent('keyup',    {bubbles:true, key: valor[i]}));
      }
      el.dispatchEvent(new Event('change', {bubbles:true}));
      el.dispatchEvent(new Event('blur',   {bubbles:true}));
    }

    simularDigitacao(campoPlaca,   placaFmt);
    simularDigitacao(campoRenavam, renavamRaw);

    setTimeout(function(){
      btnVerificar.click();
      U.box(st,true,'Placa <b>'+placaFmt+'</b> e Renavam preenchidos!<br><span style="font-size:11px;color:#555">Aguardando verificacao...</span>');
    },300);
  });

  // ── Preencher Data ────────────────────────────────────────────────────
  document.getElementById('antt-data-btn').addEventListener('click',function(){
    var ds=document.getElementById('antt-data-status');
    if(!jq||!mom)return U.box(ds,false,'jQuery ou moment.js nao encontrados.');
    var hj=new Date();
    var dd=String(hj.getDate()).padStart(2,'0');
    var mm=String(hj.getMonth()+1).padStart(2,'0');
    var yy=hj.getFullYear();
    var di=dd+'/'+mm+'/'+yy;
    var fim=new Date(hj);
    fim.setFullYear(fim.getFullYear()+1);
    var df=String(fim.getDate()).padStart(2,'0')+'/'+String(fim.getMonth()+1).padStart(2,'0')+'/'+fim.getFullYear();
    U.injetarData('DataInicio',di);
    U.injetarData('DataFim',df);
    setTimeout(function(){
      var vi=jq('#DataInicio').find('input').first().val();
      var vf=jq('#DataFim').find('input').first().val();
      if(vi===di&&vf===df)U.box(ds,true,'Datas preenchidas! <b>'+di+'</b> ate <b>'+df+'</b>');
      else if(!vi&&!vf)U.box(ds,false,'Clique em <b>Verificar</b> primeiro.');
      else U.box(ds,false,'Parcial — Inicio: <b>'+(vi||'vazio')+'</b> | Fim: <b>'+(vf||'vazio')+'</b>');
    },400);
  });

  // ── Marcar Declaracoes ────────────────────────────────────────────────
  document.getElementById('antt-check-btn').addEventListener('click',function(){
    var st=document.getElementById('antt-check-status');
    var c1=document.getElementById('ExisteContrato');
    var c2=document.getElementById('InformacoesVerdadeiras');
    if(!c1||!c2)return U.box(st,false,'Checkboxes nao encontrados.');
    function marcar(cb){cb.checked=true;cb.dispatchEvent(new Event('change',{bubbles:true}));cb.dispatchEvent(new Event('click',{bubbles:true}));}
    marcar(c1);marcar(c2);
    if(c1.checked&&c2.checked)U.box(st,true,'Declaracoes marcadas!');
    else U.box(st,false,'Erro ao marcar os checkboxes.');
  });

  inp.focus();
})();
