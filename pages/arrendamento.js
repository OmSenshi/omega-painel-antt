// pages/arrendamento.js — Cadastrar Contrato de Arrendamento (v60 — com salvar manual)
(function(){
  var U   = window.OmegaUtils;
  var jq  = window.OmegaJQ;
  var mom = window.OmegaMom;

  // ── ABA: CRLV ───────────────────────────────────────────────────
  U.registrarAba('crlv', 'CRLV', ''
    +'<div id="omega-dropzone" class="om-dropzone">'
      +'<div class="om-drop-txt" id="omega-drop-txt">Arraste o CRLV aqui<br><span>(PDF ou imagem)</span></div>'
    +'</div>'
    +'<input type="file" id="omega-file-input" accept=".pdf,image/*" style="display:none">'
    +'<div id="omega-extract-status"></div>'
    +'<div class="om-flex om-mb">'
      +'<input id="omega-import-input" class="om-input om-input-sm" placeholder="Cole o codigo OMEGA aqui" style="flex:1">'
      +'<button id="omega-import-btn" class="om-btn om-btn-coral om-btn-sm" style="white-space:nowrap">Importar</button>'
    +'</div>'
    +'<div class="om-grid om-grid-2 om-mb-sm">'
      +'<div>'
        +'<label class="om-label">CPF / CNPJ</label>'
        +'<input id="antt-cpf-input" class="om-input" placeholder="00000000000">'
        +'<div id="antt-preview" class="om-preview"></div>'
      +'</div>'
      +'<div>'
        +'<label class="om-label">Nome</label>'
        +'<input id="antt-nome-input" class="om-input" placeholder="Nome completo">'
        +'<div id="antt-nome-preview" class="om-preview"></div>'
      +'</div>'
    +'</div>'
    +'<div class="om-grid om-grid-2 om-mb-sm">'
      +'<div>'
        +'<label class="om-label">Placa</label>'
        +'<input id="antt-placa-input" class="om-input" placeholder="ABC1234" maxlength="8" style="text-transform:uppercase">'
        +'<div id="antt-placa-preview" class="om-preview"></div>'
      +'</div>'
      +'<div>'
        +'<label class="om-label">Renavam</label>'
        +'<input id="antt-renavam-input" class="om-input" placeholder="00000000000" maxlength="15">'
        +'<button id="antt-salvar-manual-btn" class="om-btn om-btn-green" style="margin-top: 8px; width: 100%; display: block; box-sizing: border-box;" type="button">💾 Salvar no Histórico</button>'
      +'</div>'
    +'</div>'
    +'<div class="om-grid om-grid-2 om-mb-sm">'
      +'<button id="antt-btn" class="om-btn om-btn-blue">Subst. CPF/Nome</button>'
      +'<button id="antt-veiculo-btn" class="om-btn om-btn-blue">Preencher e Verificar</button>'
    +'</div>'
    +'<div id="antt-status"></div>'
    +'<div id="antt-veiculo-status"></div>'
  );

  // ── ABA: CONTRATO ───────────────────────────────────────────────
  U.registrarAba('contrato', 'Contrato', ''
    +'<div class="om-grid om-grid-2 om-mb-sm">'
      +'<button id="antt-data-btn" class="om-btn om-btn-green">Preencher Data</button>'
      +'<button id="antt-check-btn" class="om-btn om-btn-purple">Marcar Declaracoes</button>'
    +'</div>'
    +'<div id="antt-data-status"></div>'
    +'<div id="antt-check-status"></div>'
  );

  // ── ABA: HISTORICO ──────────────────────────────────────────────
  U.registrarAba('historico', 'Historico', ''
    +'<div id="omega-historico-lista" class="om-hist-scroll"></div>'
    +'<div id="omega-historico-vazio" class="om-vazio">Nenhum registro nas ultimas 24h</div>'
  , function(){ renderHistorico(); });

  // ── Helper: setar campo ─────────────────────────────────────────
  function setarCampo(id, valor){
    var el = document.getElementById(id);
    if(el && valor){ el.value = valor; el.dispatchEvent(new Event('input')); }
  }
  function preencherCamposCRLV(dados){
    if(dados.cpf)     setarCampo('antt-cpf-input', dados.cpf);
    if(dados.nome)    setarCampo('antt-nome-input', dados.nome.toUpperCase());
    if(dados.placa)   setarCampo('antt-placa-input', dados.placa.toUpperCase());
    if(dados.renavam){ var el=document.getElementById('antt-renavam-input'); if(el) el.value=dados.renavam; }
  }

  // ── Drag and Drop ────────────────────────────────────────────────
  var dropzone=document.getElementById('omega-dropzone'), fileInput=document.getElementById('omega-file-input');
  var dropTxt=document.getElementById('omega-drop-txt'), exSt=document.getElementById('omega-extract-status');
  dropzone.addEventListener('click', function(){ fileInput.click(); });
  dropzone.addEventListener('dragover', function(e){ e.preventDefault(); dropzone.classList.add('om-dropzone-active'); });
  dropzone.addEventListener('dragleave', function(){ dropzone.classList.remove('om-dropzone-active'); });
  dropzone.addEventListener('drop', function(e){
    e.preventDefault(); dropzone.classList.remove('om-dropzone-active');
    var file=e.dataTransfer.files[0]; if(file) processarArquivo(file);
  });
  fileInput.addEventListener('change', function(){ if(this.files[0]) processarArquivo(this.files[0]); });

  function processarArquivo(file) {
    dropTxt.innerHTML = file.name;
    U.box(exSt, true, 'Extraindo dados...');
    window.OmegaExtractor.extrair(file,
      function(dados){ preencherCamposCRLV(dados); U.adicionarHistorico(dados); U.box(exSt, true, 'Dados extraidos! Revise e clique nos botoes.'); },
      function(erro){ U.box(exSt, false, erro); }
    );
  }

  // ── Previews ─────────────────────────────────────────────────────
  document.getElementById('antt-cpf-input').addEventListener('input', function(){
    var r=this.value.replace(/\D/g,''), p=document.getElementById('antt-preview');
    if(r.length===11)      p.innerHTML='<span class="ok">'+U.fCPF(r)+'</span>';
    else if(r.length===14) p.innerHTML='<span class="ok">'+U.fCNPJ(r)+'</span>';
    else if(r.length>0)    p.innerHTML='<span class="warn">'+r.length+' dig.</span>';
    else p.textContent='';
  });
  document.getElementById('antt-nome-input').addEventListener('input', function(){
    var p=document.getElementById('antt-nome-preview'), v=this.value.trim();
    p.innerHTML = v ? '<span class="ok">'+v.toUpperCase()+'</span>' : '';
  });
  document.getElementById('antt-placa-input').addEventListener('input', function(){
    var p=document.getElementById('antt-placa-preview'), raw=this.value.replace(/[^A-Z0-9]/gi,'').toUpperCase(), val=U.validarPlaca(raw);
    if(val) p.innerHTML='<span class="ok">'+U.formatarPlaca(val)+'</span>';
    else if(raw.length>0) p.innerHTML='<span class="warn">'+raw.length+'/7</span>';
    else p.textContent='';
  });

  // ── Salvar Manual no Histórico ───────────────────────────────────
  document.getElementById('antt-salvar-manual-btn').addEventListener('click', function(){
    var placa = document.getElementById('antt-placa-input').value.trim().toUpperCase();
    var renavam = document.getElementById('antt-renavam-input').value.trim();

    if(placa.length >= 7 && renavam.length >= 9) {
        // Aproveitando a própria função do seu OmegaUtils!
        U.adicionarHistorico({ placa: placa, renavam: renavam });
        
        var btn = this;
        var textoOriginal = btn.innerHTML;
        btn.innerHTML = '✅ Salvo!';
        btn.style.backgroundColor = '#2E7D32';
        setTimeout(function(){
            btn.innerHTML = textoOriginal;
            btn.style.backgroundColor = ''; // Remove o inline pra voltar a cor original da classe
        }, 2000);
    } else {
        alert('❌ Por favor, preencha a Placa e o Renavam corretamente antes de salvar.');
    }
  });

  // ── Substituir CPF + Nome ────────────────────────────────────────
  document.getElementById('antt-btn').addEventListener('click', function(){
    var st=document.getElementById('antt-status');
    var raw=document.getElementById('antt-cpf-input').value.replace(/\D/g,'');
    var nn=document.getElementById('antt-nome-input').value.trim().toUpperCase();
    var msgs=[];
    if(raw&&(raw.length===11||raw.length===14)){
      var nf=U.fAuto(raw), ap=null;
      var nt=document.getElementById('NomesTransportador');
      if(nt&&nt.value){try{var arr=JSON.parse(nt.value);if(arr&&arr[0]&&arr[0].CpfCnpj)ap=arr[0].CpfCnpj.replace(/\D/g,'');}catch(e){}}
      if(!ap) ap=U.getDoc();
      var tot=0;
      if(ap){var r1=U.substituirTudo(U.fAuto(ap),nf),r2=U.substituirTudo(ap,raw);tot=r1.total+r2.total;}
      var novoJson=JSON.stringify([{"CpfCnpj":raw,"Nome":nn||""}]);
      var nt2=document.getElementById('NomesTransportador');
      if(nt2){nt2.value=novoJson;nt2.setAttribute('value',novoJson);}
      ['Placa','Renavam','DataInicio','DataFim'].forEach(function(id){var el=document.getElementById(id);if(el&&el.getAttribute('cpfcnpjs'))el.setAttribute('cpfcnpjs',novoJson);});
      var sel=document.getElementById('CPFCNPJArrendanteTransportador'),selecionou=false;
      if(sel&&jq){
        for(var i=0;i<sel.options.length;i++){if(sel.options[i].value.replace(/\D/g,'')===raw||sel.options[i].text.replace(/\D/g,'')===raw){jq(sel).val(sel.options[i].value).trigger('change');selecionou=true;break;}}
        if(!selecionou){for(var i=0;i<sel.options.length;i++){if(sel.options[i].text&&sel.options[i].text!=='Selecione'){jq(sel).val(sel.options[i].value).trigger('change');selecionou=true;break;}}}
      }
      msgs.push('CPF: <b>'+nf+'</b> ('+tot+' trocas'+(selecionou?', selecionado':'')+')');
    }
    if(nn){var an=U.getNome();if(an){var res=U.substituirTudo(an,nn);var cv=document.getElementById('NomeArrendanteInput');if(cv){cv.removeAttribute('disabled');cv.value=nn;cv.setAttribute('disabled','disabled');}msgs.push('Nome: <b>'+nn+'</b> ('+res.total+' trocas)');}}
    if(msgs.length>0) U.box(st,true,msgs.join('<br>')); else U.box(st,false,'Preencha CPF/CNPJ ou Nome.');
  });

  // ── Preencher e Verificar ────────────────────────────────────────
  document.getElementById('antt-veiculo-btn').addEventListener('click', function(){
    var st=document.getElementById('antt-veiculo-status');
    var placaRaw=document.getElementById('antt-placa-input').value.replace(/[^A-Z0-9]/gi,'').toUpperCase();
    var renavamRaw=document.getElementById('antt-renavam-input').value.trim();
    var placaVal=U.validarPlaca(placaRaw);
    if(!placaVal) return U.box(st,false,'Placa invalida.');
    if(!renavamRaw) return U.box(st,false,'Preencha o Renavam.');
    var campoPlaca=document.getElementById('Placa'),campoRenavam=document.getElementById('Renavam');
    if(!campoPlaca||!campoRenavam) return U.box(st,false,'Campos nao encontrados na pagina.');
    U.box(st,true,'Preenchendo...');campoPlaca.removeAttribute('disabled');
    
    U.digitarCharAChar(campoPlaca,placaVal,{delay:80,delayEspecial:{4:150},onDone:function(){
      var pf=campoPlaca.value;campoRenavam.removeAttribute('disabled');campoRenavam.value=renavamRaw;
      campoRenavam.dispatchEvent(new Event('input',{bubbles:true}));
      campoRenavam.dispatchEvent(new Event('change',{bubbles:true}));
      campoRenavam.dispatchEvent(new Event('blur',{bubbles:true}));
      
      // Dispara o Ajax instantaneamente
      var jqRef=unsafeWindow.jQuery;
      jqRef.ajax({
        type:'GET',url:'/ContratoArrendamento/verificarVeiculo',cache:false,
        data:{placa:campoPlaca.value.toUpperCase(),renavam:campoRenavam.value,cpfCnpjProprietario:document.getElementById('CPFCNPJArrendante').value},
        success:function(resp){
            if(resp&&resp.success===true){
                var di=document.getElementById('DataInicio'),df=document.getElementById('DataFim'),ca=document.getElementById('CPFCNPJArrendatario');
                if(di)di.removeAttribute('disabled');if(df)df.removeAttribute('disabled');if(ca)ca.removeAttribute('disabled');
                try{if(jqRef('#DataInicio').data('DateTimePicker'))jqRef('#DataInicio').data('DateTimePicker').enable();if(jqRef('#DataFim').data('DateTimePicker'))jqRef('#DataFim').data('DateTimePicker').enable();}catch(
