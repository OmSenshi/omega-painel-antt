// pages/arrendamento.js — modulo: Cadastrar Contrato de Arrendamento
(function(){
  var U   = window.OmegaUtils;
  var jq  = window.OmegaJQ;
  var mom = window.OmegaMom;

  // ── Injeta o HTML das secoes ──────────────────────────────────────────
  U.addSecao(''
    // CPF/CNPJ
    +'<label style="font-size:12px;color:#555">CPF ou CNPJ:</label>'
    +'<input id="antt-cpf-input" placeholder="000.000.000-00 ou 00.000.000/0000-00" style="width:100%;margin-top:6px;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box">'
    +'<div id="antt-preview" style="margin-top:8px;font-size:12px;color:#666;min-height:16px"></div>'
    +'<button id="antt-btn" style="width:100%;margin-top:10px;padding:10px;background:#1a73e8;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;font-weight:bold">Substituir na Pagina</button>'
    +'<div id="antt-status" style="margin-top:10px;font-size:12px;min-height:16px;border-radius:8px;padding:0"></div>'
    // Nome
    +'<hr style="margin:14px 0;border:none;border-top:1px solid #eee">'
    +'<label style="font-size:12px;color:#555">Nome do Arrendante:</label>'
    +'<input id="antt-nome-input" placeholder="Ex: Joao da Silva" style="width:100%;margin-top:6px;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box">'
    +'<div id="antt-nome-preview" style="margin-top:6px;font-size:12px;color:#666;min-height:16px"></div>'
    +'<button id="antt-nome-btn" style="width:100%;margin-top:10px;padding:10px;background:#1a73e8;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;font-weight:bold">Substituir Nome</button>'
    +'<div id="antt-nome-status" style="margin-top:10px;font-size:12px;min-height:16px;border-radius:8px;padding:0"></div>'
    // Data
    +'<hr style="margin:14px 0;border:none;border-top:1px solid #eee">'
    +'<button id="antt-data-btn" style="width:100%;padding:10px;background:#34a853;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;font-weight:bold">Preencher Data</button>'
    +'<div id="antt-data-status" style="margin-top:10px;font-size:12px;min-height:16px;border-radius:8px;padding:0"></div>'
    // Declaracoes
    +'<hr style="margin:14px 0;border:none;border-top:1px solid #eee">'
    +'<button id="antt-check-btn" style="width:100%;padding:10px;background:#6f42c1;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer;font-weight:bold">Marcar Declaracoes</button>'
    +'<div id="antt-check-status" style="margin-top:10px;font-size:12px;min-height:16px;border-radius:8px;padding:0"></div>'
  );

  // ── CPF/CNPJ ──────────────────────────────────────────────────────────
  var inp=document.getElementById('antt-cpf-input');
  inp.addEventListener('input',function(){
    var r=this.value.replace(/\D/g,''),p=document.getElementById('antt-preview');
    if(r.length===11)p.innerHTML='<span style="color:green">CPF: <b>'+U.fCPF(r)+'</b></span>';
    else if(r.length===14)p.innerHTML='<span style="color:green">CNPJ: <b>'+U.fCNPJ(r)+'</b></span>';
    else if(r.length>0)p.innerHTML='<span style="color:orange">'+r.length+' digitos</span>';
    else p.textContent='';
  });

  document.getElementById('antt-btn').addEventListener('click',function(){
    var st=document.getElementById('antt-status');
    var raw=inp.value.replace(/\D/g,'');
    if(!raw)return U.box(st,false,'Nenhum valor digitado.');
    if(raw.length!==11&&raw.length!==14)return U.box(st,false,raw.length+' digitos. CPF=11, CNPJ=14.');
    var nf=U.fAuto(raw), ap=U.getDoc();
    if(!ap)return U.box(st,false,'CPF/CNPJ nao encontrado na pagina.');
    var af=U.fAuto(ap);
    var r1=U.substituirTudo(af,nf);
    var r2=U.substituirTudo(ap,raw);
    var tot=r1.total+r2.total;
    if(tot===0)U.box(st,false,'Nenhuma ocorrencia de <b>'+af+'</b> encontrada.');
    else U.box(st,true,'Substituido! <b>'+nf+'</b><br><span style="color:#555;font-size:11px">Total: '+tot+' substituicoes</span>');
    inp.value='';
    document.getElementById('antt-preview').textContent='';
  });

  // ── Nome ──────────────────────────────────────────────────────────────
  var ni=document.getElementById('antt-nome-input');
  ni.addEventListener('input',function(){
    var p=document.getElementById('antt-nome-preview'),v=this.value.trim();
    if(v)p.innerHTML='<span style="color:green">Sera: <b>'+v.toUpperCase()+'</b></span>';
    else p.textContent='';
  });

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
    else U.box(st,true,'Nome substituido! <b>'+nn+'</b><br><span style="color:#555;font-size:11px">Total: '+res.total+' substituicoes</span>');
    ni.value='';
    document.getElementById('antt-nome-preview').textContent='';
  });

  // ── Data ──────────────────────────────────────────────────────────────
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
      if(vi===di&&vf===df)U.box(ds,true,'Datas preenchidas!<br><span style="font-size:11px;color:#555">Inicio: <b>'+di+'</b> | Fim: <b>'+df+'</b></span>');
      else if(!vi&&!vf)U.box(ds,false,'Clique em <b>Verificar</b> o veiculo primeiro.');
      else U.box(ds,false,'Parcial — Inicio: <b>'+(vi||'vazio')+'</b> | Fim: <b>'+(vf||'vazio')+'</b>');
    },400);
  });

  // ── Declaracoes ───────────────────────────────────────────────────────
  document.getElementById('antt-check-btn').addEventListener('click',function(){
    var st=document.getElementById('antt-check-status');
    var c1=document.getElementById('ExisteContrato');
    var c2=document.getElementById('InformacoesVerdadeiras');
    if(!c1||!c2)return U.box(st,false,'Checkboxes nao encontrados na pagina.');
    function marcar(cb){cb.checked=true;cb.dispatchEvent(new Event('change',{bubbles:true}));cb.dispatchEvent(new Event('click',{bubbles:true}));}
    marcar(c1);marcar(c2);
    if(c1.checked&&c2.checked)U.box(st,true,'Declaracoes marcadas!<br><span style="font-size:11px;color:#555">Existe Contrato: marcado | Informacoes Verdadeiras: marcado</span>');
    else U.box(st,false,'Erro ao marcar os checkboxes.');
  });

  inp.focus();
})();
