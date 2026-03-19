// pages/cadastro.js — modulo: Cadastro e Movimentacao de Frota
(function(){
  var U  = window.OmegaUtils;
  var jq = window.OmegaJQ;

  var CEPS = {
    MG: ['32220-390','32017-900','32280-370'],
    SP: ['04805-140','01002-900','08062-700'],
    RJ: ['23032-486','20211-110','22793-620']
  };

  function cepAleatorio(estado) {
    var lista = CEPS[estado] || CEPS.MG;
    return lista[Math.floor(Math.random() * lista.length)];
  }

  function abaPortalAtiva() {
    var tab = document.querySelector('.nav-tabs .nav-link.active');
    return tab ? tab.getAttribute('href') : '';
  }

  function tipoPedido() {
    var el = document.querySelector('.main_content');
    return el ? (el.getAttribute('data-tipo-pedido') || '') : '';
  }

  function tipoCadastro() {
    var cnpj = document.getElementById('CpfCnpjTransportador');
    if(!cnpj || !cnpj.value) return 'CPF';
    return cnpj.value.replace(/\D/g,'').length === 14 ? 'CNPJ' : 'CPF';
  }

  // ── HTML do painel ──────────────────────────────────────────────
  U.addSecao(''

    // Abas proprias do cadastro.js
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:10px">'
      +'<button id="omega-cad-tab-cad"   onclick="OmegaCadTab(\'cad\')"   style="padding:7px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:12px;cursor:pointer;font-weight:bold">Cadastro</button>'
      +'<button id="omega-cad-tab-acoes" onclick="OmegaCadTab(\'acoes\')" style="padding:7px;background:#e8f0fe;color:#1a73e8;border:none;border-radius:7px;font-size:12px;cursor:pointer;font-weight:bold">Acoes</button>'
    +'</div>'

    // ══ ABA CADASTRO ══════════════════════════════════════════════
    +'<div id="omega-aba-cad">'

      +'<div style="display:flex;gap:6px;margin-bottom:8px">'
        +'<input id="omega-cad-import-input" placeholder="Cole o codigo OMEGA Cadastro aqui" style="flex:1;padding:6px;border:1px solid #ddd;border-radius:7px;font-size:11px;box-sizing:border-box">'
        +'<button id="omega-cad-import-btn" style="padding:6px 10px;background:#f1a9a0;color:#fff;border:none;border-radius:7px;font-size:11px;cursor:pointer;font-weight:bold;white-space:nowrap">Importar</button>'
      +'</div>'
      +'<div id="omega-cad-import-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0;margin-bottom:6px"></div>'

      +'<div id="omega-cad-campos" style="display:none">'

        +'<div id="omega-cad-tipo-badge" style="font-size:11px;font-weight:bold;color:#fff;background:#1a73e8;border-radius:6px;padding:3px 8px;display:inline-block;margin-bottom:8px"></div>'

        // Identidade (CPF)
        +'<div id="omega-cad-sec-id" style="display:none">'
          +'<div style="font-size:10px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Identidade / CNH</div>'
          +'<div style="display:grid;grid-template-columns:2fr 1fr;gap:6px;margin-bottom:6px">'
            +'<div><label style="font-size:10px;color:#888">Numero</label>'
              +'<input id="omega-cad-identidade" placeholder="000000" style="width:100%;margin-top:2px;padding:5px;border:1px solid #ddd;border-radius:6px;font-size:12px;box-sizing:border-box"></div>'
            +'<div><label style="font-size:10px;color:#888">UF</label>'
              +'<input id="omega-cad-uf" placeholder="MG" maxlength="2" style="width:100%;margin-top:2px;padding:5px;border:1px solid #ddd;border-radius:6px;font-size:12px;box-sizing:border-box;text-transform:uppercase"></div>'
          +'</div>'
        +'</div>'

        // Endereco
        +'<div id="omega-cad-sec-end" style="display:none">'
          +'<div style="font-size:10px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Endereco</div>'
          +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:5px">'
            +'<div><label style="font-size:10px;color:#888">CEP</label>'
              +'<input id="omega-cad-cep" placeholder="00000000" style="width:100%;margin-top:2px;padding:5px;border:1px solid #ddd;border-radius:6px;font-size:12px;box-sizing:border-box"></div>'
            +'<div><label style="font-size:10px;color:#888">Numero</label>'
              +'<input id="omega-cad-numero" placeholder="0" style="width:100%;margin-top:2px;padding:5px;border:1px solid #ddd;border-radius:6px;font-size:12px;box-sizing:border-box"></div>'
          +'</div>'
          +'<div style="margin-bottom:5px"><label style="font-size:10px;color:#888">Logradouro</label>'
            +'<input id="omega-cad-logradouro" placeholder="Nome da rua" style="width:100%;margin-top:2px;padding:5px;border:1px solid #ddd;border-radius:6px;font-size:12px;box-sizing:border-box"></div>'
          +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">'
            +'<div><label style="font-size:10px;color:#888">Bairro</label>'
              +'<input id="omega-cad-bairro" placeholder="Bairro" style="width:100%;margin-top:2px;padding:5px;border:1px solid #ddd;border-radius:6px;font-size:12px;box-sizing:border-box"></div>'
            +'<div><label style="font-size:10px;color:#888">Complemento</label>'
              +'<input id="omega-cad-complemento" placeholder="Apto..." style="width:100%;margin-top:2px;padding:5px;border:1px solid #ddd;border-radius:6px;font-size:12px;box-sizing:border-box"></div>'
          +'</div>'
        +'</div>'

        // Contato (CNPJ)
        +'<div id="omega-cad-sec-cont" style="display:none">'
          +'<div style="font-size:10px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Contato</div>'
          +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">'
            +'<div><label style="font-size:10px;color:#888">Telefone</label>'
              +'<input id="omega-cad-telefone" placeholder="11999998888" style="width:100%;margin-top:2px;padding:5px;border:1px solid #ddd;border-radius:6px;font-size:12px;box-sizing:border-box"></div>'
            +'<div><label style="font-size:10px;color:#888">Email</label>'
              +'<input id="omega-cad-email" placeholder="email@exemplo.com" style="width:100%;margin-top:2px;padding:5px;border:1px solid #ddd;border-radius:6px;font-size:12px;box-sizing:border-box"></div>'
          +'</div>'
        +'</div>'

        // Socio (CNPJ)
        +'<div id="omega-cad-sec-soc" style="display:none">'
          +'<div style="font-size:10px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Gestor / Socio</div>'
          +'<div style="margin-bottom:6px"><label style="font-size:10px;color:#888">CPF do Socio</label>'
            +'<input id="omega-cad-cpf-socio" placeholder="00000000000" style="width:100%;margin-top:2px;padding:5px;border:1px solid #ddd;border-radius:6px;font-size:12px;box-sizing:border-box"></div>'
        +'</div>'

        +'<button id="omega-cad-iniciar-btn" style="width:100%;padding:9px;background:#34a853;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;font-weight:bold;margin-top:2px">&#9654; Iniciar Automacao</button>'
        +'<div id="omega-cad-iniciar-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0;margin-top:5px"></div>'

      +'</div>'
    +'</div>' // fim omega-aba-cad

    // ══ ABA ACOES ═════════════════════════════════════════════════
    +'<div id="omega-aba-acoes" style="display:none">'

      +'<div id="omega-cad-contatos" style="display:none">'
        +'<div style="font-size:11px;font-weight:bold;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">Endereco</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px">'
          +'<button id="omega-cep-mg" style="padding:8px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:13px;cursor:pointer;font-weight:bold">MG</button>'
          +'<button id="omega-cep-sp" style="padding:8px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:13px;cursor:pointer;font-weight:bold">SP</button>'
          +'<button id="omega-cep-rj" style="padding:8px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:13px;cursor:pointer;font-weight:bold">RJ</button>'
        +'</div>'
        +'<div id="omega-cep-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0;margin-bottom:8px"></div>'
        +'<hr style="margin:8px 0;border:none;border-top:1px solid #eee">'
        +'<div style="font-size:11px;font-weight:bold;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">Contato</div>'
        +'<button id="omega-contato-btn" style="width:100%;padding:8px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:13px;cursor:pointer;font-weight:bold">Adicionar Telefone + Email</button>'
        +'<div id="omega-contato-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0"></div>'
      +'</div>'

      +'<div id="omega-cad-rt" style="display:none">'
        +'<div style="font-size:11px;font-weight:bold;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">Responsavel Tecnico</div>'
        +'<button id="omega-rt-btn" style="width:100%;padding:8px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:13px;cursor:pointer;font-weight:bold">Adicionar RT</button>'
        +'<div id="omega-rt-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0"></div>'
      +'</div>'

      +'<div id="omega-cad-veiculo" style="display:none">'
        +'<div style="font-size:11px;font-weight:bold;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px">Veiculo</div>'
        +'<div id="omega-veiculo-hist" style="max-height:180px;overflow-y:auto;margin-bottom:6px"></div>'
        +'<div id="omega-veiculo-vazio" style="font-size:11px;color:#aaa;text-align:center;padding:8px 0">Nenhum veiculo no historico</div>'
        +'<div id="omega-veiculo-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0"></div>'
      +'</div>'

    +'</div>' // fim omega-aba-acoes
  );

  // ── Troca de abas internas ──────────────────────────────────────
  unsafeWindow.OmegaCadTab = function(aba) {
    document.getElementById('omega-aba-cad').style.display   = aba==='cad'   ? 'block' : 'none';
    document.getElementById('omega-aba-acoes').style.display = aba==='acoes' ? 'block' : 'none';
    document.getElementById('omega-cad-tab-cad').style.background   = aba==='cad'   ? '#1a73e8' : '#e8f0fe';
    document.getElementById('omega-cad-tab-cad').style.color        = aba==='cad'   ? '#fff'    : '#1a73e8';
    document.getElementById('omega-cad-tab-acoes').style.background = aba==='acoes' ? '#1a73e8' : '#e8f0fe';
    document.getElementById('omega-cad-tab-acoes').style.color      = aba==='acoes' ? '#fff'    : '#1a73e8';
    if(aba==='acoes') atualizarSecaoAcoes();
  };

  // ── Detecta aba do portal e atualiza secao Acoes ────────────────
  function atualizarSecaoAcoes() {
    var aba = abaPortalAtiva();
    var isMovimentacao = tipoPedido() === 'MovimentacaoFrota';
    var cont    = document.getElementById('omega-cad-contatos');
    var rt      = document.getElementById('omega-cad-rt');
    var veiculo = document.getElementById('omega-cad-veiculo');

    if(isMovimentacao){
      cont.style.display    = 'none';
      rt.style.display      = 'none';
      veiculo.style.display = 'block';
      renderHistoricoVeiculo();
      return;
    }

    cont.style.display    = aba==='#contatos'           ? 'block' : 'none';
    rt.style.display      = aba==='#responsavelTecnico' ? 'block' : 'none';
    veiculo.style.display = aba==='#veiculo'            ? 'block' : 'none';
    if(aba==='#veiculo') renderHistoricoVeiculo();
  }

  document.querySelectorAll('.nav-tabs .nav-link').forEach(function(link){
    link.addEventListener('shown.bs.tab', function(){
      // Se estiver na aba Acoes, atualiza automaticamente
      if(document.getElementById('omega-aba-acoes').style.display !== 'none'){
        atualizarSecaoAcoes();
      }
    });
    link.addEventListener('click', function(){
      setTimeout(function(){
        if(document.getElementById('omega-aba-acoes').style.display !== 'none'){
          atualizarSecaoAcoes();
        }
      }, 300);
    });
  });

  // ── Importar codigo ─────────────────────────────────────────────
  document.getElementById('omega-cad-import-btn').addEventListener('click', function(){
    var codigo = document.getElementById('omega-cad-import-input').value.trim();
    var st     = document.getElementById('omega-cad-import-status');
    if(!codigo) return U.box(st, false, 'Cole o codigo gerado pelo Claude.');

    var dados = {};
    codigo.split('|').forEach(function(par){
      var idx = par.indexOf('=');
      if(idx !== -1){
        dados[par.substring(0,idx).trim()] = par.substring(idx+1).trim();
      }
    });

    var tipo = (dados.tipo || '').toUpperCase();
    if(tipo !== 'CPF' && tipo !== 'CNPJ')
      return U.box(st, false, 'Codigo invalido. Certifique-se de copiar o codigo completo.');

    document.getElementById('omega-cad-tipo-badge').textContent = tipo==='CPF' ? 'Cadastro CPF' : 'Cadastro CNPJ';
    document.getElementById('omega-cad-sec-id').style.display   = tipo==='CPF'  ? 'block' : 'none';
    document.getElementById('omega-cad-sec-cont').style.display = tipo==='CNPJ' ? 'block' : 'none';
    document.getElementById('omega-cad-sec-soc').style.display  = tipo==='CNPJ' ? 'block' : 'none';
    document.getElementById('omega-cad-sec-end').style.display  = 'block';

    function set(id, val){ var el=document.getElementById(id); if(el) el.value = val||''; }
    set('omega-cad-identidade',  dados.identidade);
    set('omega-cad-uf',          (dados.uf||'').toUpperCase());
    set('omega-cad-cep',         (dados.cep||'').replace(/\D/g,''));
    set('omega-cad-logradouro',  dados.logradouro);
    set('omega-cad-numero',      dados.numero);
    set('omega-cad-complemento', dados.complemento);
    set('omega-cad-bairro',      dados.bairro);
    set('omega-cad-telefone',    (dados.telefone||'').replace(/\D/g,''));
    set('omega-cad-email',       dados.email);
    set('omega-cad-cpf-socio',   (dados.cpf_socio||'').replace(/\D/g,''));

    document.getElementById('omega-cad-campos').style.display = 'block';
    document.getElementById('omega-cad-import-input').value   = '';
    U.box(st, true, 'Dados importados! Confira e clique em Iniciar.');
  });

  // ── Botao Iniciar ───────────────────────────────────────────────
  document.getElementById('omega-cad-iniciar-btn').addEventListener('click', function(e){
    e.preventDefault();
    e.stopPropagation();
    var st = document.getElementById('omega-cad-iniciar-status');
    if(this._omegaClicado) return;
    this._omegaClicado = true;
    var self = this;
    setTimeout(function(){ self._omegaClicado = false; }, 8000);
    var tipo = document.getElementById('omega-cad-tipo-badge').textContent.indexOf('CNPJ') !== -1 ? 'CNPJ' : 'CPF';
    U.box(st, true, 'Iniciando...');
    if(tipo === 'CPF') iniciarCPF(st);
    else iniciarCNPJ(st);
  });

  // ── AUTOMACAO CPF ───────────────────────────────────────────────
  function iniciarCPF(st) {
    var identidade  = document.getElementById('omega-cad-identidade').value.trim() || '000000';
    var uf          = document.getElementById('omega-cad-uf').value.trim().toUpperCase();
    var cep         = document.getElementById('omega-cad-cep').value.replace(/\D/g,'');
    var logradouro  = document.getElementById('omega-cad-logradouro').value.trim();
    var numero      = document.getElementById('omega-cad-numero').value.trim() || '0';
    var bairro      = document.getElementById('omega-cad-bairro').value.trim() || '0';
    var complemento = document.getElementById('omega-cad-complemento').value.trim();

    U.box(st, true, '1/3 — Transportador...');
    preencherTransportadorCPF(identidade, uf, function(){
      setTimeout(function(){
        U.box(st, true, '2/3 — Endereco...');
        preencherEnderecoComDados(cep, logradouro, numero, bairro, complemento, st, function(){
          setTimeout(function(){
            U.box(st, true, '3/3 — RT...');
            adicionarRT(st, function(){ U.box(st, true, 'Automacao CPF concluida!'); });
          }, 1000);
        });
      }, 800);
    });
  }

  // ── AUTOMACAO CNPJ ──────────────────────────────────────────────
  function iniciarCNPJ(st) {
    var cep         = document.getElementById('omega-cad-cep').value.replace(/\D/g,'');
    var logradouro  = document.getElementById('omega-cad-logradouro').value.trim();
    var numero      = document.getElementById('omega-cad-numero').value.trim() || '0';
    var bairro      = document.getElementById('omega-cad-bairro').value.trim() || '0';
    var complemento = document.getElementById('omega-cad-complemento').value.trim();
    var telefone    = document.getElementById('omega-cad-telefone').value.replace(/\D/g,'') || gerarTelefone();
    var email       = document.getElementById('omega-cad-email').value.trim() || gerarEmail();
    var cpfSocio    = document.getElementById('omega-cad-cpf-socio').value.replace(/\D/g,'');

    U.box(st, true, '1/4 — Capacidade financeira...');
    var cbCap = document.getElementById('TransportadorEtc_SituacaoCapacidadeFinanceira');
    if(cbCap){ jq(cbCap).iCheck('check'); cbCap.checked=true; jq(cbCap).trigger('ifChecked').trigger('change'); }

    setTimeout(function(){
      U.box(st, true, '2/4 — Endereco...');
      preencherEnderecoComDados(cep, logradouro, numero, bairro, complemento, st, function(){
        setTimeout(function(){
          U.box(st, true, '3/4 — Contatos...');
          adicionarContato('2', telefone, function(){
            setTimeout(function(){
              adicionarContato('4', email, function(){
                setTimeout(function(){
                  U.box(st, true, '4/4 — Gestor + RT...');
                  if(cpfSocio){
                    adicionarGestor(cpfSocio, st, function(){
                      setTimeout(function(){
                        adicionarRT(st, function(){ U.box(st, true, 'Automacao CNPJ concluida!'); });
                      }, 1000);
                    });
                  } else {
                    adicionarRT(st, function(){ U.box(st, false, 'RT ok. Gestor sem CPF — adicione manualmente.'); });
                  }
                }, 1000);
              });
            }, 1500);
          });
        }, 1000);
      });
    }, 800);
  }

  // ── Preencher Transportador CPF ─────────────────────────────────
  function preencherTransportadorCPF(identidade, uf, callback) {
    var campoIdent = document.getElementById('Identidade') || document.querySelector('input[name="Identidade"]');
    var campoOrgao = document.getElementById('OrgaoEmissor') || document.querySelector('input[name="OrgaoEmissor"]');
    var campoUF    = document.getElementById('UF') || document.querySelector('select[name*="UF"]');

    if(!campoIdent) {
      var tabTransp = document.querySelector('a[href="#transportador"], a[href*="Transportador"]');
      if(tabTransp) tabTransp.click();
      setTimeout(function(){
        campoIdent = document.getElementById('Identidade') || document.querySelector('input[name="Identidade"]');
        campoOrgao = document.getElementById('OrgaoEmissor') || document.querySelector('input[name="OrgaoEmissor"]');
        campoUF    = document.getElementById('UF') || document.querySelector('select[name*="UF"]');
        _preencherIdent(campoIdent, campoOrgao, campoUF, identidade, uf, callback);
      }, 800);
      return;
    }
    _preencherIdent(campoIdent, campoOrgao, campoUF, identidade, uf, callback);
  }

  function _preencherIdent(campoIdent, campoOrgao, campoUF, identidade, uf, callback) {
    if(campoIdent){
      campoIdent.removeAttribute('disabled'); campoIdent.removeAttribute('readonly');
      campoIdent.value = identidade;
      jq(campoIdent).trigger('input').trigger('change').trigger('blur');
    }
    if(campoOrgao){
      campoOrgao.removeAttribute('disabled'); campoOrgao.removeAttribute('readonly');
      campoOrgao.value = 'SSP';
      jq(campoOrgao).trigger('input').trigger('change').trigger('blur');
    }
    if(campoUF && uf){
      for(var i=0; i<campoUF.options.length; i++){
        if(campoUF.options[i].value===uf || campoUF.options[i].text===uf){
          campoUF.selectedIndex=i; jq(campoUF).trigger('change'); break;
        }
      }
    }
    callback();
  }

  // ── Preencher Endereco ──────────────────────────────────────────
  function preencherEnderecoComDados(cep, logradouro, numero, bairro, complemento, st, callback) {
    var btn = document.querySelector('[data-action*="EnderecoPedido/Novo"]');
    if(!btn){ U.box(st, false, 'Botao Endereco nao encontrado.'); callback(); return; }
    btn.click();

    setTimeout(function(){
      var campoCep  = document.getElementById('Cep');
      var campoTipo = document.getElementById('CodigoTipoEndereco');
      if(!campoCep){ U.box(st, false, 'Modal de endereco nao abriu.'); callback(); return; }

      if(campoTipo){ campoTipo.value='COR'; jq(campoTipo).trigger('change'); }

      var cepFinal     = cep ? cep.replace(/\D/g,'') : cepAleatorio('MG').replace(/\D/g,'');
      var temDadosReais = !!(cep && logradouro && logradouro !== '0');

      campoCep.value=''; campoCep.focus();
      campoCep.dispatchEvent(new Event('focus',{bubbles:true}));

      var i=0;
      function proxChar(){
        if(i >= cepFinal.length){
          campoCep.dispatchEvent(new Event('input',{bubbles:true}));
          campoCep.dispatchEvent(new Event('change',{bubbles:true}));
          campoCep.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Tab',keyCode:9}));
          campoCep.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,key:'Tab',keyCode:9}));
          campoCep.dispatchEvent(new Event('blur',{bubbles:true}));
          var l=document.getElementById('Logradouro');
          if(l){l.focus();setTimeout(function(){l.blur();},100);}

          var tent=0, intv=setInterval(function(){
            tent++;
            var l2=document.getElementById('Logradouro');
            if((l2&&l2.value&&l2.value.trim()!=='')||tent>=20){
              clearInterval(intv);
              setTimeout(function(){
                var l3=document.getElementById('Logradouro');
                var n3=document.getElementById('Numero');
                var b3=document.getElementById('Bairro');
                var c3=document.getElementById('Complemento');
                if(l3){l3.value=temDadosReais?logradouro:'0';jq(l3).trigger('input').trigger('change');}
                if(n3){n3.value=temDadosReais?(numero||'0'):'0';jq(n3).trigger('input').trigger('change');}
                if(b3){b3.value=temDadosReais?(bairro||'0'):'0';jq(b3).trigger('input').trigger('change');}
                if(c3&&complemento&&temDadosReais){c3.value=complemento;jq(c3).trigger('input').trigger('change');}
                setTimeout(function(){
                  document.querySelectorAll('input[type="checkbox"]').forEach(function(cb){
                    var label=cb.closest('label')||cb.parentElement;
                    var txt=label?label.textContent:'';
                    if(txt.toLowerCase().includes('mesmo')||txt.toLowerCase().includes('comercial')){
                      if(!cb.checked){cb.checked=true;jq(cb).trigger('change').trigger('click');}
                    }
                  });
                  setTimeout(function(){
                    var btnS=document.querySelector('.btn-salvar-endereco');
                    if(btnS&&!btnS._omegaClicado){
                      btnS._omegaClicado=true; btnS.click();
                      setTimeout(function(){if(btnS)btnS._omegaClicado=false;},3000);
                    }
                    setTimeout(callback,800);
                  },500);
                },400);
              },300);
            }
          },500);
          return;
        }
        var ch=cepFinal[i]; campoCep.value+=ch;
        campoCep.dispatchEvent(new Event('input',{bubbles:true}));
        campoCep.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,cancelable:true,key:ch}));
        i++; setTimeout(proxChar,80);
      }
      proxChar();
    },1200);
  }

  // ── Adicionar Gestor ────────────────────────────────────────────
  function adicionarGestor(cpfSocio, st, callback) {
    var cpfFmt = cpfSocio.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/,'$1.$2.$3-$4');
    var btn = document.querySelector('[data-action*="GestorPedido/Novo"],[data-action*="Gestor/Criar"]');
    if(!btn){
      document.querySelectorAll('button,a').forEach(function(el){
        if(!btn && el.textContent.toLowerCase().trim()==='adicionar gestor') btn=el;
      });
    }
    if(!btn){ U.box(st,false,'Botao Gestor nao encontrado — adicione manualmente.'); callback(); return; }
    btn.click();
    setTimeout(function(){
      var campoFunc=document.getElementById('CodigoTipoVinculo');
      var campoCPF =document.getElementById('CpfCnpj');
      if(!campoCPF){ U.box(st,false,'Modal Gestor nao abriu.'); callback(); return; }
      if(campoFunc){campoFunc.value='1';jq(campoFunc).trigger('change');}
      setTimeout(function(){
        campoCPF.value=cpfFmt; jq(campoCPF).trigger('input').trigger('change').trigger('blur');
        var tent=0, intv=setInterval(function(){
          tent++;
          var nome=document.getElementById('Nome');
          var btnS=document.querySelector('.btn-salvar-gestor');
          if((nome&&nome.value&&nome.value.trim()!=='')||tent>15){
            clearInterval(intv);
            if(!nome||!nome.value){callback();return;}
            var cb=document.getElementById('isDeclaracaoIdoneoArtigo2');
            if(cb){jq(cb).iCheck('check');cb.checked=true;jq(cb).trigger('ifChecked').trigger('change');}
            setTimeout(function(){
              if(btnS&&!btnS._omegaClicado){
                btnS._omegaClicado=true; btnS.removeAttribute('disabled'); btnS.click();
                setTimeout(function(){if(btnS)btnS._omegaClicado=false;},3000);
              }
              setTimeout(callback,800);
            },600);
          }
        },500);
      },400);
    },1000);
  }

  // ── Adicionar RT ─────────────────────────────────────────────────
  var CPF_RT = '071.417.536-64';

  function adicionarRT(st, callback) {
    var btn=document.querySelector('[data-action*="ResponsavelTecnico/Criar"]');
    if(!btn){callback();return;}
    btn.click();
    setTimeout(function(){
      var cpf=document.getElementById('Cpf');
      if(!cpf){callback();return;}
      cpf.value=CPF_RT; jq(cpf).trigger('input').trigger('change').trigger('blur');
      var tent=0, intv=setInterval(function(){
        tent++;
        var nome=document.getElementById('Nome');
        var btnS=document.getElementById('btnSalvar');
        if((nome&&nome.value&&nome.value.trim()!=='')||tent>15){
          clearInterval(intv);
          if(!nome||!nome.value){callback();return;}
          function marcarICheck(cb){if(!cb)return;jq(cb).iCheck('check');cb.checked=true;jq(cb).trigger('ifChecked').trigger('change');}
          marcarICheck(document.getElementById('FoiResponsavelTecnico'));
          marcarICheck(document.getElementById('isDeclaracaoIdoneoArtigo2'));
          setTimeout(function(){
            if(btnS&&!btnS._omegaClicado){
              btnS._omegaClicado=true; btnS.removeAttribute('disabled'); btnS.click();
              setTimeout(function(){if(btnS)btnS._omegaClicado=false;},3000);
            }
            setTimeout(callback,800);
          },600);
        }
      },500);
    },1000);
  }

  // ── Geradores aleatorios ─────────────────────────────────────────
  function gerarTelefone(){
    var ddds=['11','21','31','41','51'];
    var n='9'; for(var i=0;i<8;i++) n+=Math.floor(Math.random()*10);
    return ddds[Math.floor(Math.random()*ddds.length)]+n;
  }
  function gerarEmail(){
    var c='abcdefghijklmnopqrstuvwxyz0123456789',s='';
    for(var i=0;i<12;i++) s+=c[Math.floor(Math.random()*c.length)];
    return s+'@yahoo.com';
  }

  // ── CEP manual (aba Acoes) ──────────────────────────────────────
  function preencherEndereco(estado) {
    var st=document.getElementById('omega-cep-status');
    var cep=cepAleatorio(estado);
    var btn=document.querySelector('[data-action*="EnderecoPedido/Novo"]');
    if(!btn)return U.box(st,false,'Botao Endereco nao encontrado.');
    U.box(st,true,'Abrindo formulario...');
    btn.click();
    setTimeout(function(){
      var campoCep=document.getElementById('Cep');
      var campoTipo=document.getElementById('CodigoTipoEndereco');
      if(!campoCep)return U.box(st,false,'Modal nao abriu.');
      if(campoTipo){campoTipo.value='COR';jq(campoTipo).trigger('change');}
      var cepN=cep.replace(/\D/g,'');
      campoCep.value=''; campoCep.focus();
      campoCep.dispatchEvent(new Event('focus',{bubbles:true}));
      var i=0;
      function proxChar(){
        if(i>=cepN.length){
          campoCep.dispatchEvent(new Event('input',{bubbles:true}));
          campoCep.dispatchEvent(new Event('change',{bubbles:true}));
          campoCep.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Tab',keyCode:9}));
          campoCep.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,key:'Tab',keyCode:9}));
          campoCep.dispatchEvent(new Event('blur',{bubbles:true}));
          var l=document.getElementById('Logradouro');
          if(l){l.focus();setTimeout(function(){l.blur();},100);}
          U.box(st,true,'CEP '+cep+' inserido...');
          var tent=0, intv=setInterval(function(){
            tent++;
            var l2=document.getElementById('Logradouro');
            if((l2&&l2.value&&l2.value.trim()!=='')||tent>=20){
              clearInterval(intv);
              setTimeout(function(){
                var l3=document.getElementById('Logradouro'),n3=document.getElementById('Numero'),b3=document.getElementById('Bairro');
                if(l3){l3.value='0';jq(l3).trigger('input').trigger('change');}
                if(n3){n3.value='0';jq(n3).trigger('input').trigger('change');}
                if(b3){b3.value='0';jq(b3).trigger('input').trigger('change');}
                setTimeout(function(){
                  document.querySelectorAll('input[type="checkbox"]').forEach(function(cb){
                    var label=cb.closest('label')||cb.parentElement;
                    var txt=label?label.textContent:'';
                    if(txt.toLowerCase().includes('mesmo')||txt.toLowerCase().includes('comercial')){
                      if(!cb.checked){cb.checked=true;jq(cb).trigger('change').trigger('click');}
                    }
                  });
                  setTimeout(function(){
                    var btnS=document.querySelector('.btn-salvar-endereco');
                    if(btnS&&!btnS._omegaClicado){
                      btnS._omegaClicado=true; btnS.click();
                      U.box(st,true,'Endereco ('+estado+'/'+cep+') salvo!');
                      setTimeout(function(){if(btnS)btnS._omegaClicado=false;},3000);
                    }
                  },600);
                },500);
              },300);
            }
          },500);
          return;
        }
        var ch=cepN[i]; campoCep.value+=ch;
        campoCep.dispatchEvent(new Event('input',{bubbles:true}));
        campoCep.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,cancelable:true,key:ch}));
        i++; setTimeout(proxChar,80);
      }
      proxChar();
    },1200);
  }

  document.getElementById('omega-cep-mg').addEventListener('click',function(){preencherEndereco('MG');});
  document.getElementById('omega-cep-sp').addEventListener('click',function(){preencherEndereco('SP');});
  document.getElementById('omega-cep-rj').addEventListener('click',function(){preencherEndereco('RJ');});

  // ── Contato manual (aba Acoes) ──────────────────────────────────
  document.getElementById('omega-contato-btn').addEventListener('click',function(){
    var st=document.getElementById('omega-contato-status');
    if(tipoCadastro()==='CPF'){U.box(st,true,'CPF — contatos ja preenchidos pelo portal.');return;}
    U.box(st,true,'Adicionando telefone...');
    adicionarContato('2',gerarTelefone(),function(ok){
      if(!ok){U.box(st,false,'Erro no telefone.');return;}
      setTimeout(function(){
        var email=gerarEmail();
        adicionarContato('4',email,function(ok2){
          if(ok2) U.box(st,true,'Tel + email adicionados!<br><span style="font-size:10px">'+email+'</span>');
          else U.box(st,false,'Telefone ok, erro no email.');
        });
      },1500);
    });
  });

  function adicionarContato(tipoVal,contatoVal,callback){
    var btn=document.querySelector('[data-action*="ContatoPedido/Novo"]');
    if(!btn){callback(false);return;}
    btn.click();
    setTimeout(function(){
      var t=document.getElementById('CodigoTipoContato');
      var c=document.getElementById('Contato');
      if(!t||!c){callback(false);return;}
      t.value=tipoVal; jq(t).trigger('change');
      setTimeout(function(){
        c.value=''; c.focus(); c.dispatchEvent(new Event('focus',{bubbles:true}));
        var chars=contatoVal.split(''),i=0;
        function proxChar(){
          if(i>=chars.length){
            c.dispatchEvent(new Event('change',{bubbles:true}));
            c.dispatchEvent(new Event('blur',{bubbles:true}));
            setTimeout(function(){
              var s=document.querySelector('.btn-salvar-contato');
              if(s&&!s._omegaClicado){
                s._omegaClicado=true; s.click();
                setTimeout(function(){if(s)s._omegaClicado=false;},3000);
                callback(true);
              } else if(!s) callback(false);
            },400);
            return;
          }
          var ch=chars[i]; c.value+=ch;
          c.dispatchEvent(new Event('input',{bubbles:true}));
          c.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,cancelable:true,key:ch}));
          i++; setTimeout(proxChar,50);
        }
        proxChar();
      },300);
    },800);
  }

  // ── RT manual (aba Acoes) ───────────────────────────────────────
  document.getElementById('omega-rt-btn').addEventListener('click',function(){
    var st=document.getElementById('omega-rt-status');
    adicionarRT(st,function(){U.box(st,true,'RT adicionado! CPF: '+CPF_RT);});
  });

  // ── Historico de veiculos ───────────────────────────────────────
  var HIST_KEY='omega_historico';

  function carregarHistorico(){
    try{
      var raw=(typeof GM_getValue!=='undefined')?GM_getValue(HIST_KEY,'[]'):localStorage.getItem(HIST_KEY)||'[]';
      return JSON.parse(raw).filter(function(i){return(Date.now()-i.ts)<86400000;});
    }catch(e){return[];}
  }

  function renderHistoricoVeiculo(){
    var lista=carregarHistorico();
    var el=document.getElementById('omega-veiculo-hist');
    var vazio=document.getElementById('omega-veiculo-vazio');
    if(!el)return;
    if(lista.length===0){el.innerHTML='';if(vazio)vazio.style.display='block';return;}
    if(vazio)vazio.style.display='none';
    el.innerHTML=lista.map(function(item,idx){
      var p=item.placa||'';
      var display=/^[A-Z]{3}[0-9]{4}$/.test(p)?p.substring(0,3)+'-'+p.substring(3):p;
      return '<div style="display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f0f0f0">'
        +'<div style="font-size:12px;font-weight:bold;color:#333">'+display+'</div>'
        +'<button onclick="OmegaUsarVeiculoCad('+idx+')" style="padding:4px 9px;background:#1a73e8;color:#fff;border:none;border-radius:6px;font-size:11px;cursor:pointer">Usar</button>'
      +'</div>';
    }).join('');
  }

  function monitorarPopupsVeiculo(st,callback){
    var tent=0,intv=setInterval(function(){
      tent++;
      var bbSim=document.querySelector('.bootbox-confirm button[data-bb-handler="confirm"]');
      if(bbSim&&bbSim.offsetParent!==null){
        clearInterval(intv);
        U.box(st,true,'Popup! Confirmando em 3s...');
        setTimeout(function(){
          bbSim.click();
          setTimeout(function(){
            var tent2=0,intv2=setInterval(function(){
              tent2++;
              var modal=document.getElementById('manterVeiculoModal');
              var titulo=modal?modal.querySelector('.modal-title'):null;
              var ehMov=titulo&&titulo.textContent.indexOf('Movimenta')!==-1;
              var vis=modal&&(modal.style.display==='block'||modal.classList.contains('show'));
              var btnEx=document.querySelector('.btn-confirmar-exclusao');
              if(ehMov&&vis&&btnEx){
                clearInterval(intv2);
                setTimeout(function(){btnEx.click();setTimeout(function(){var btnInc=document.querySelector('.btn-confirmar-inclusao');if(btnInc)btnInc.click();setTimeout(callback,1500);},1500);},500);
              } else if(tent2>=15){clearInterval(intv2);callback();}
            },300);
          },1500);
        },3000);
        return;
      }
      var chassi=document.getElementById('Chassi');
      if(chassi&&chassi.value&&chassi.value.trim()!==''){clearInterval(intv);callback();return;}
      if(tent>=20){clearInterval(intv);callback();}
    },300);
  }

  unsafeWindow.OmegaUsarVeiculoCad=function(idx){
    var st=document.getElementById('omega-veiculo-status');
    var lista=carregarHistorico();
    var item=lista[idx];
    if(!item)return U.box(st,false,'Item nao encontrado.');
    var isMovimentacao=document.querySelector('[data-tipo-pedido="MovimentacaoFrota"]')!==null;
    var modal=document.getElementById('manterVeiculoModal');
    var popupAberto=modal&&(modal.style.display==='block'||modal.classList.contains('show'));
    var tituloModal=modal?modal.querySelector('.modal-title'):null;
    var ehPopupVeiculo=tituloModal&&tituloModal.textContent.indexOf('Dados do Ve')!==-1;

    function preencher(){
      var campoPlaca=document.getElementById('Placa');
      var campoRenavam=document.getElementById('Renavam');
      var btnVerificar=document.getElementById('verificar');
      if(!campoPlaca||!campoRenavam)return U.box(st,false,'Modal do veiculo nao abriu.');
      var placaVal=(item.placa||'').replace(/[^A-Z0-9]/gi,'').toUpperCase();
      campoPlaca.removeAttribute('disabled'); campoPlaca.value=''; campoPlaca.focus();
      campoPlaca.dispatchEvent(new Event('focus',{bubbles:true}));
      var i=0;
      function proxChar(){
        if(i>=placaVal.length){
          campoPlaca.dispatchEvent(new Event('change',{bubbles:true}));
          campoPlaca.dispatchEvent(new Event('blur',{bubbles:true}));
          setTimeout(function(){
            campoRenavam.removeAttribute('disabled'); campoRenavam.value=item.renavam||'';
            campoRenavam.dispatchEvent(new Event('input',{bubbles:true}));
            campoRenavam.dispatchEvent(new Event('change',{bubbles:true}));
            campoRenavam.dispatchEvent(new Event('blur',{bubbles:true}));
            setTimeout(function(){
              jq.ajax({type:'GET',url:'/Veiculo/BuscarVeiculo',cache:false,
                data:{placa:campoPlaca.value.toUpperCase(),renavam:campoRenavam.value},
                success:function(){setTimeout(function(){if(btnVerificar)btnVerificar.click();},500);},
                error:function(){setTimeout(function(){if(btnVerificar)btnVerificar.click();},500);}
              });
              monitorarPopupsVeiculo(st,function(){
                var tara=document.getElementById('Tara');
                if(tara&&(!tara.value||tara.value==='')){tara.removeAttribute('disabled');tara.value='2';jq(tara).trigger('input').trigger('change');}
                setTimeout(function(){
                  var btnS=document.querySelector('.btn-salvar-veiculo')||document.querySelector('.btn-confirmar-inclusao');
                  if(btnS){btnS.removeAttribute('disabled');btnS.click();U.box(st,true,'Veiculo salvo! Placa: <b>'+campoPlaca.value+'</b>');}
                  else U.box(st,false,'Botao Salvar nao encontrado.');
                },800);
              });
            },400);
          },300);
          return;
        }
        var ch=placaVal[i];
        campoPlaca.value=placaVal.substring(0,i+1);
        campoPlaca.dispatchEvent(new Event('input',{bubbles:true}));
        campoPlaca.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,cancelable:true,key:ch}));
        i++; setTimeout(proxChar,i===4?150:80);
      }
      proxChar();
    }

    if(isMovimentacao&&popupAberto&&ehPopupVeiculo){U.box(st,true,'Preenchendo...');preencher();}
    else{
      var btnAdd=document.querySelector('[data-action*="VeiculoPedido/Novo"]');
      if(!btnAdd)return U.box(st,false,'Botao Adicionar Veiculo nao encontrado.');
      btnAdd.click(); setTimeout(preencher,1500);
    }
  };

})();
