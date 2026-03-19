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
    var lista = CEPS[estado];
    return lista[Math.floor(Math.random() * lista.length)];
  }

  function abaAtiva() {
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

  // ── Aumenta o painel ────────────────────────────────────────────
  var painel = document.getElementById('antt-helper');
  if(painel) painel.style.width = '500px';

  // ── HTML do painel ──────────────────────────────────────────────
  U.addSecao(''

    // Abas internas
    +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:12px">'
      +'<button id="omega-cad-tab-cad"    onclick="OmegaCadAba(\'cad\')"    style="padding:7px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:12px;cursor:pointer;font-weight:bold">Cadastro</button>'
      +'<button id="omega-cad-tab-acoes"  onclick="OmegaCadAba(\'acoes\')"  style="padding:7px;background:#e8f0fe;color:#1a73e8;border:none;border-radius:7px;font-size:12px;cursor:pointer;font-weight:bold">Acoes</button>'
    +'</div>'

    // ══════════════════════════════════════════════════
    // ABA: CADASTRO
    // ══════════════════════════════════════════════════
    +'<div id="omega-aba-cad">'

      // Campo importar codigo
      +'<div style="display:flex;gap:6px;margin-bottom:10px">'
        +'<input id="omega-cad-import-input" placeholder="Cole o codigo OMEGA Cadastro aqui" style="flex:1;padding:7px;border:1px solid #ddd;border-radius:7px;font-size:11px;box-sizing:border-box">'
        +'<button id="omega-cad-import-btn" style="padding:7px 10px;background:#f1a9a0;color:#fff;border:none;border-radius:7px;font-size:11px;cursor:pointer;font-weight:bold;white-space:nowrap">Importar</button>'
      +'</div>'
      +'<div id="omega-cad-import-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0;margin-bottom:8px"></div>'

      // Campos editaveis — aparecem apos importar
      +'<div id="omega-cad-campos" style="display:none">'

        // Tipo detectado
        +'<div id="omega-cad-tipo-badge" style="font-size:11px;font-weight:bold;color:#fff;background:#1a73e8;border-radius:6px;padding:4px 10px;display:inline-block;margin-bottom:10px"></div>'

        // SECAO: Identidade (CPF)
        +'<div id="omega-cad-sec-id" style="display:none">'
          +'<div style="font-size:10px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px">Identidade / CNH</div>'
          +'<div style="display:grid;grid-template-columns:2fr 1fr;gap:6px;margin-bottom:8px">'
            +'<div>'
              +'<label style="font-size:10px;color:#888">Numero (RG ou CNH)</label>'
              +'<input id="omega-cad-identidade" placeholder="000000" style="width:100%;margin-top:2px;padding:6px;border:1px solid #ddd;border-radius:7px;font-size:12px;box-sizing:border-box">'
            +'</div>'
            +'<div>'
              +'<label style="font-size:10px;color:#888">UF</label>'
              +'<input id="omega-cad-uf" placeholder="MG" maxlength="2" style="width:100%;margin-top:2px;padding:6px;border:1px solid #ddd;border-radius:7px;font-size:12px;box-sizing:border-box;text-transform:uppercase">'
            +'</div>'
          +'</div>'
        +'</div>'

        // SECAO: Endereco
        +'<div id="omega-cad-sec-end" style="display:none">'
          +'<div style="font-size:10px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px">Endereco</div>'
          +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">'
            +'<div>'
              +'<label style="font-size:10px;color:#888">CEP</label>'
              +'<input id="omega-cad-cep" placeholder="00000000" style="width:100%;margin-top:2px;padding:6px;border:1px solid #ddd;border-radius:7px;font-size:12px;box-sizing:border-box">'
            +'</div>'
            +'<div>'
              +'<label style="font-size:10px;color:#888">Numero</label>'
              +'<input id="omega-cad-numero" placeholder="0" style="width:100%;margin-top:2px;padding:6px;border:1px solid #ddd;border-radius:7px;font-size:12px;box-sizing:border-box">'
            +'</div>'
          +'</div>'
          +'<div style="margin-bottom:6px">'
            +'<label style="font-size:10px;color:#888">Logradouro</label>'
            +'<input id="omega-cad-logradouro" placeholder="Nome da rua" style="width:100%;margin-top:2px;padding:6px;border:1px solid #ddd;border-radius:7px;font-size:12px;box-sizing:border-box">'
          +'</div>'
          +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">'
            +'<div>'
              +'<label style="font-size:10px;color:#888">Bairro</label>'
              +'<input id="omega-cad-bairro" placeholder="Bairro" style="width:100%;margin-top:2px;padding:6px;border:1px solid #ddd;border-radius:7px;font-size:12px;box-sizing:border-box">'
            +'</div>'
            +'<div>'
              +'<label style="font-size:10px;color:#888">Complemento</label>'
              +'<input id="omega-cad-complemento" placeholder="Apto, Bloco..." style="width:100%;margin-top:2px;padding:6px;border:1px solid #ddd;border-radius:7px;font-size:12px;box-sizing:border-box">'
            +'</div>'
          +'</div>'
        +'</div>'

        // SECAO: Contato (CNPJ)
        +'<div id="omega-cad-sec-cont" style="display:none">'
          +'<div style="font-size:10px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px">Contato</div>'
          +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">'
            +'<div>'
              +'<label style="font-size:10px;color:#888">Telefone</label>'
              +'<input id="omega-cad-telefone" placeholder="11999998888" style="width:100%;margin-top:2px;padding:6px;border:1px solid #ddd;border-radius:7px;font-size:12px;box-sizing:border-box">'
            +'</div>'
            +'<div>'
              +'<label style="font-size:10px;color:#888">Email</label>'
              +'<input id="omega-cad-email" placeholder="email@exemplo.com" style="width:100%;margin-top:2px;padding:6px;border:1px solid #ddd;border-radius:7px;font-size:12px;box-sizing:border-box">'
            +'</div>'
          +'</div>'
        +'</div>'

        // SECAO: Socio/Gestor (CNPJ)
        +'<div id="omega-cad-sec-soc" style="display:none">'
          +'<div style="font-size:10px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px">Gestor / Socio</div>'
          +'<div style="margin-bottom:8px">'
            +'<label style="font-size:10px;color:#888">CPF do Socio</label>'
            +'<input id="omega-cad-cpf-socio" placeholder="00000000000" style="width:100%;margin-top:2px;padding:6px;border:1px solid #ddd;border-radius:7px;font-size:12px;box-sizing:border-box">'
          +'</div>'
        +'</div>'

        // Botao Iniciar
        +'<button id="omega-cad-iniciar-btn" style="width:100%;padding:10px;background:#34a853;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;font-weight:bold;margin-top:4px">▶ Iniciar Automacao</button>'
        +'<div id="omega-cad-iniciar-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0;margin-top:6px"></div>'

      +'</div>' // fim omega-cad-campos
    +'</div>' // fim omega-aba-cad

    // ══════════════════════════════════════════════════
    // ABA: ACOES (conteudo original do modulo)
    // ══════════════════════════════════════════════════
    +'<div id="omega-aba-acoes" style="display:none">'

      +'<div id="omega-cad-contatos">'
        +'<div style="font-size:11px;font-weight:bold;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Endereco</div>'
        +'<div style="font-size:11px;color:#555;margin-bottom:6px">Selecione o estado:</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px">'
          +'<button id="omega-cep-mg" style="padding:9px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:13px;cursor:pointer;font-weight:bold">MG</button>'
          +'<button id="omega-cep-sp" style="padding:9px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:13px;cursor:pointer;font-weight:bold">SP</button>'
          +'<button id="omega-cep-rj" style="padding:9px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:13px;cursor:pointer;font-weight:bold">RJ</button>'
        +'</div>'
        +'<div id="omega-cep-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0;margin-bottom:10px"></div>'
        +'<hr style="margin:10px 0;border:none;border-top:1px solid #eee">'
        +'<div style="font-size:11px;font-weight:bold;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Contato</div>'
        +'<button id="omega-contato-btn" style="width:100%;padding:9px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:13px;cursor:pointer;font-weight:bold">Adicionar Telefone + Email</button>'
        +'<div id="omega-contato-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0"></div>'
      +'</div>'

      +'<div id="omega-cad-rt" style="display:none">'
        +'<div style="font-size:11px;font-weight:bold;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Responsavel Tecnico</div>'
        +'<button id="omega-rt-btn" style="width:100%;padding:9px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:13px;cursor:pointer;font-weight:bold">Adicionar RT</button>'
        +'<div id="omega-rt-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0"></div>'
      +'</div>'

      +'<div id="omega-cad-veiculo" style="display:none">'
        +'<div style="font-size:11px;font-weight:bold;color:#888;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px">Veiculo</div>'
        +'<div id="omega-veiculo-hist" style="max-height:200px;overflow-y:auto;margin-bottom:8px"></div>'
        +'<div id="omega-veiculo-vazio" style="font-size:11px;color:#aaa;text-align:center;padding:10px 0">Nenhum veiculo no historico</div>'
        +'<div id="omega-veiculo-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0"></div>'
      +'</div>'

    +'</div>' // fim omega-aba-acoes
  );

  // ── Troca de abas internas ──────────────────────────────────────
  unsafeWindow.OmegaCadAba = function(aba) {
    document.getElementById('omega-aba-cad').style.display    = aba==='cad'   ? 'block' : 'none';
    document.getElementById('omega-aba-acoes').style.display  = aba==='acoes' ? 'block' : 'none';
    document.getElementById('omega-cad-tab-cad').style.background   = aba==='cad'   ? '#1a73e8' : '#e8f0fe';
    document.getElementById('omega-cad-tab-cad').style.color        = aba==='cad'   ? '#fff'    : '#1a73e8';
    document.getElementById('omega-cad-tab-acoes').style.background = aba==='acoes' ? '#1a73e8' : '#e8f0fe';
    document.getElementById('omega-cad-tab-acoes').style.color      = aba==='acoes' ? '#fff'    : '#1a73e8';
    if(aba==='acoes') atualizarSecao();
  };

  // ── Importar codigo OMEGA Cadastro ─────────────────────────────
  document.getElementById('omega-cad-import-btn').addEventListener('click', function(){
    var codigo = document.getElementById('omega-cad-import-input').value.trim();
    var st     = document.getElementById('omega-cad-import-status');
    if(!codigo) return U.box(st, false, 'Cole o codigo gerado pelo Claude.');

    var dados = {};
    codigo.split('|').forEach(function(par){
      var idx = par.indexOf('=');
      if(idx !== -1){
        var chave = par.substring(0, idx).trim();
        var valor = par.substring(idx + 1).trim();
        if(valor) dados[chave] = valor;
      }
    });

    var tipo = (dados.tipo || '').toUpperCase();
    if(tipo !== 'CPF' && tipo !== 'CNPJ'){
      return U.box(st, false, 'Codigo invalido. Certifique-se de copiar o codigo completo.');
    }

    // Badge tipo
    var badge = document.getElementById('omega-cad-tipo-badge');
    badge.textContent = tipo === 'CPF' ? 'Cadastro CPF' : 'Cadastro CNPJ';

    // Mostra/oculta secoes conforme tipo
    document.getElementById('omega-cad-sec-id').style.display   = tipo==='CPF'  ? 'block' : 'none';
    document.getElementById('omega-cad-sec-cont').style.display = tipo==='CNPJ' ? 'block' : 'none';
    document.getElementById('omega-cad-sec-soc').style.display  = tipo==='CNPJ' ? 'block' : 'none';
    document.getElementById('omega-cad-sec-end').style.display  = 'block';

    // Preenche campos
    if(dados.identidade) document.getElementById('omega-cad-identidade').value  = dados.identidade;
    if(dados.uf)         document.getElementById('omega-cad-uf').value          = dados.uf.toUpperCase();
    if(dados.cep)        document.getElementById('omega-cad-cep').value         = dados.cep.replace(/\D/g,'');
    if(dados.logradouro) document.getElementById('omega-cad-logradouro').value  = dados.logradouro;
    if(dados.numero)     document.getElementById('omega-cad-numero').value      = dados.numero;
    if(dados.complemento)document.getElementById('omega-cad-complemento').value = dados.complemento;
    if(dados.bairro)     document.getElementById('omega-cad-bairro').value      = dados.bairro;
    if(dados.telefone)   document.getElementById('omega-cad-telefone').value    = dados.telefone.replace(/\D/g,'');
    if(dados.email)      document.getElementById('omega-cad-email').value       = dados.email;
    if(dados.cpf_socio)  document.getElementById('omega-cad-cpf-socio').value   = dados.cpf_socio.replace(/\D/g,'');

    document.getElementById('omega-cad-campos').style.display = 'block';
    document.getElementById('omega-cad-import-input').value   = '';
    U.box(st, true, 'Dados importados! Confira os campos e clique em Iniciar.');
  });

  // ── Botao Iniciar Automacao ─────────────────────────────────────
  document.getElementById('omega-cad-iniciar-btn').addEventListener('click', function(){
    var st   = document.getElementById('omega-cad-iniciar-status');
    var badge = document.getElementById('omega-cad-tipo-badge').textContent;
    var tipo  = badge.indexOf('CNPJ') !== -1 ? 'CNPJ' : 'CPF';

    if(this._omegaClicado) return;
    this._omegaClicado = true;
    var self = this;
    setTimeout(function(){ self._omegaClicado = false; }, 5000);

    U.box(st, true, 'Iniciando automacao...');

    if(tipo === 'CPF') {
      iniciarAutomacaoCPF(st);
    } else {
      iniciarAutomacaoCNPJ(st);
    }
  });

  // ── AUTOMACAO CPF ───────────────────────────────────────────────
  function iniciarAutomacaoCPF(st) {
    var identidade  = document.getElementById('omega-cad-identidade').value.trim() || '000000';
    var uf          = document.getElementById('omega-cad-uf').value.trim().toUpperCase();
    var cep         = document.getElementById('omega-cad-cep').value.replace(/\D/g,'');
    var logradouro  = document.getElementById('omega-cad-logradouro').value.trim();
    var numero      = document.getElementById('omega-cad-numero').value.trim() || '0';
    var bairro      = document.getElementById('omega-cad-bairro').value.trim() || '0';
    var complemento = document.getElementById('omega-cad-complemento').value.trim();

    U.box(st, true, 'Passo 1/3: Preenchendo dados do transportador...');

    // Preenche Identidade, Orgao Emissor e UF na aba Transportador
    preencherTransportadorCPF(identidade, uf, function(okTransp){
      if(!okTransp) U.box(st, false, 'Aviso: campos de identidade nao encontrados. Verifique a aba Transportador.');

      setTimeout(function(){
        U.box(st, true, 'Passo 2/3: Preenchendo endereco...');
        preencherEnderecoComDados(cep, logradouro, numero, bairro, complemento, st, function(){
          setTimeout(function(){
            U.box(st, true, 'Passo 3/3: Adicionando RT...');
            adicionarRT(st, function(){
              U.box(st, true, 'Automacao CPF concluida!');
            });
          }, 1000);
        });
      }, 800);
    });
  }

  // ── AUTOMACAO CNPJ ──────────────────────────────────────────────
  function iniciarAutomacaoCNPJ(st) {
    var cep         = document.getElementById('omega-cad-cep').value.replace(/\D/g,'');
    var logradouro  = document.getElementById('omega-cad-logradouro').value.trim();
    var numero      = document.getElementById('omega-cad-numero').value.trim() || '0';
    var bairro      = document.getElementById('omega-cad-bairro').value.trim() || '0';
    var complemento = document.getElementById('omega-cad-complemento').value.trim();
    var telefone    = document.getElementById('omega-cad-telefone').value.replace(/\D/g,'');
    var email       = document.getElementById('omega-cad-email').value.trim();
    var cpfSocio    = document.getElementById('omega-cad-cpf-socio').value.replace(/\D/g,'');

    // Marca checkbox capacidade financeira
    U.box(st, true, 'Passo 1/4: Marcando capacidade financeira...');
    var cbCap = document.getElementById('TransportadorEtc_SituacaoCapacidadeFinanceira');
    if(cbCap){ jq(cbCap).iCheck('check'); cbCap.checked=true; jq(cbCap).trigger('ifChecked').trigger('change'); }

    setTimeout(function(){
      U.box(st, true, 'Passo 2/4: Preenchendo endereco...');
      preencherEnderecoComDados(cep, logradouro, numero, bairro, complemento, st, function(){

        setTimeout(function(){
          U.box(st, true, 'Passo 3/4: Adicionando contatos...');
          var telFinal   = telefone || gerarTelefone();
          var emailFinal = email    || gerarEmail();
          adicionarContato('2', telFinal, function(okTel){
            setTimeout(function(){
              adicionarContato('4', emailFinal, function(okEmail){
                setTimeout(function(){
                  U.box(st, true, 'Passo 4/4: Adicionando Gestor...');
                  if(cpfSocio){
                    adicionarGestor(cpfSocio, st, function(){
                      setTimeout(function(){
                        adicionarRT(st, function(){
                          U.box(st, true, 'Automacao CNPJ concluida!');
                        });
                      }, 1000);
                    });
                  } else {
                    U.box(st, false, 'CPF do socio nao informado — preencha o Gestor manualmente.');
                    setTimeout(function(){
                      adicionarRT(st, function(){
                        U.box(st, true, 'RT adicionado. Adicione o Gestor manualmente.');
                      });
                    }, 1000);
                  }
                }, 1000);
              });
            }, 1500);
          });
        }, 1000);
      });
    }, 800);
  }

  // ── Preencher Transportador CPF (Identidade + UF) ───────────────
  function preencherTransportadorCPF(identidade, uf, callback) {
    // Tenta acessar os campos diretamente (podem estar visiveis na aba Transportador)
    var campoIdent = document.getElementById('Identidade');
    var campoOrgao = document.getElementById('OrgaoEmissor');
    var campoUF    = document.getElementById('UF') || document.querySelector('select[name="UF"]');

    // Busca mais ampla se nao encontrar pelos IDs padrao
    if(!campoIdent) campoIdent = document.querySelector('input[name="Identidade"], input[placeholder*="dentidade"]');
    if(!campoOrgao) campoOrgao = document.querySelector('input[name="OrgaoEmissor"], input[placeholder*="rgao"]');
    if(!campoUF)    campoUF    = document.querySelector('select[name*="UF"], select[id*="UF"]');

    if(!campoIdent && !campoOrgao){
      // Tenta clicar na aba Transportador primeiro
      var tabTransp = document.querySelector('a[href="#transportador"], a[href*="Transportador"]');
      if(tabTransp){ tabTransp.click(); }
      setTimeout(function(){
        campoIdent = document.getElementById('Identidade') || document.querySelector('input[name="Identidade"]');
        campoOrgao = document.getElementById('OrgaoEmissor') || document.querySelector('input[name="OrgaoEmissor"]');
        campoUF    = document.getElementById('UF') || document.querySelector('select[name*="UF"]');
        _preencherCamposIdent(campoIdent, campoOrgao, campoUF, identidade, uf, callback);
      }, 800);
      return;
    }
    _preencherCamposIdent(campoIdent, campoOrgao, campoUF, identidade, uf, callback);
  }

  function _preencherCamposIdent(campoIdent, campoOrgao, campoUF, identidade, uf, callback){
    var ok = false;
    if(campoIdent){
      campoIdent.removeAttribute('disabled');
      campoIdent.removeAttribute('readonly');
      campoIdent.value = identidade;
      jq(campoIdent).trigger('input').trigger('change').trigger('blur');
      ok = true;
    }
    if(campoOrgao){
      campoOrgao.removeAttribute('disabled');
      campoOrgao.removeAttribute('readonly');
      campoOrgao.value = 'SSP';
      jq(campoOrgao).trigger('input').trigger('change').trigger('blur');
    }
    if(campoUF && uf){
      // Seleciona a UF no dropdown
      for(var i=0; i<campoUF.options.length; i++){
        if(campoUF.options[i].value === uf || campoUF.options[i].text === uf){
          campoUF.selectedIndex = i;
          jq(campoUF).trigger('change');
          break;
        }
      }
    }
    callback(ok);
  }

  // ── Preencher Endereco com dados reais ──────────────────────────
  function preencherEnderecoComDados(cep, logradouro, numero, bairro, complemento, st, callback) {
    var btn = document.querySelector('[data-action*="EnderecoPedido/Novo"]');
    if(!btn){ U.box(st, false, 'Botao Adicionar Endereco nao encontrado.'); callback(); return; }

    U.box(st, true, 'Abrindo formulario de endereco...');
    btn.click();

    setTimeout(function(){
      var campoCep  = document.getElementById('Cep');
      var campoTipo = document.getElementById('CodigoTipoEndereco');
      if(!campoCep){ U.box(st, false, 'Modal de endereco nao abriu.'); callback(); return; }

      if(campoTipo){ campoTipo.value='COR'; jq(campoTipo).trigger('change'); }

      var cepNumeros = cep ? cep.replace(/\D/g,'') : cepAleatorio('MG').replace(/\D/g,'');
      var usandoCepReal = !!cep;

      campoCep.value = '';
      campoCep.focus();
      campoCep.dispatchEvent(new Event('focus',{bubbles:true}));

      var i=0;
      function proxCharCep(){
        if(i >= cepNumeros.length){
          campoCep.dispatchEvent(new Event('input',{bubbles:true}));
          campoCep.dispatchEvent(new Event('change',{bubbles:true}));
          campoCep.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Tab',keyCode:9}));
          campoCep.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,key:'Tab',keyCode:9}));
          campoCep.dispatchEvent(new Event('blur',{bubbles:true}));
          var campoLog = document.getElementById('Logradouro');
          if(campoLog){ campoLog.focus(); setTimeout(function(){ campoLog.blur(); },100); }

          // Aguarda portal preencher logradouro
          var tent=0;
          var intv = setInterval(function(){
            tent++;
            var l = document.getElementById('Logradouro');
            var preenchido = l && l.value && l.value.trim() !== '';
            if(preenchido || tent >= 20){
              clearInterval(intv);
              setTimeout(function(){
                var l2 = document.getElementById('Logradouro');
                var n2 = document.getElementById('Numero');
                var b2 = document.getElementById('Bairro');
                var c2 = document.getElementById('Complemento');

                // Usa dados reais se disponiveis, senao usa zeros
                if(l2){ l2.value = (usandoCepReal && logradouro) ? logradouro : '0'; jq(l2).trigger('input').trigger('change'); }
                if(n2){ n2.value = (usandoCepReal && numero)     ? numero     : '0'; jq(n2).trigger('input').trigger('change'); }
                if(b2){ b2.value = (usandoCepReal && bairro)     ? bairro     : '0'; jq(b2).trigger('input').trigger('change'); }
                if(c2 && complemento){ c2.value = complemento; jq(c2).trigger('input').trigger('change'); }

                // Marca checkbox "mesmo endereco"
                setTimeout(function(){
                  document.querySelectorAll('input[type="checkbox"]').forEach(function(cb){
                    var label = cb.closest('label') || cb.parentElement;
                    var txt = label ? label.textContent : '';
                    if(txt.toLowerCase().includes('mesmo') || txt.toLowerCase().includes('comercial')){
                      if(!cb.checked){ cb.checked=true; jq(cb).trigger('change').trigger('click'); }
                    }
                  });
                  setTimeout(function(){
                    var btnS = document.querySelector('.btn-salvar-endereco');
                    if(btnS && !btnS._omegaClicado){
                      btnS._omegaClicado = true;
                      btnS.click();
                      setTimeout(function(){ if(btnS) btnS._omegaClicado=false; },3000);
                    }
                    setTimeout(callback, 800);
                  }, 500);
                }, 400);
              }, 300);
            }
          }, 500);
          return;
        }
        var ch = cepNumeros[i];
        campoCep.value += ch;
        campoCep.dispatchEvent(new Event('input',{bubbles:true}));
        campoCep.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,cancelable:true,key:ch}));
        i++;
        setTimeout(proxCharCep, 80);
      }
      proxCharCep();
    }, 1200);
  }

  // ── Adicionar Gestor (igual ao RT) ─────────────────────────────
  var CPF_RT = '071.417.536-64';

  function adicionarGestor(cpfSocio, st, callback) {
    var cpfFormatado = cpfSocio.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    var btn = document.querySelector('[data-action*="GestorPedido/Novo"], [data-action*="Gestor/Criar"]');
    if(!btn){
      // Tenta pelo texto do botao
      document.querySelectorAll('button, a').forEach(function(el){
        if(el.textContent.toLowerCase().includes('gestor') || el.textContent.toLowerCase().includes('adicionar gestor')){
          if(!btn) btn = el;
        }
      });
    }
    if(!btn){ U.box(st, false, 'Botao Gestor nao encontrado — adicione manualmente.'); callback(); return; }

    btn.click();
    setTimeout(function(){
      var campoFunc = document.getElementById('CodigoTipoVinculo');
      var campoCPF  = document.getElementById('CpfCnpj');
      if(!campoCPF){ U.box(st, false, 'Modal do Gestor nao abriu.'); callback(); return; }

      // Seleciona Socio (valor 1)
      if(campoFunc){
        campoFunc.value = '1';
        jq(campoFunc).trigger('change');
      }

      setTimeout(function(){
        campoCPF.value = cpfFormatado;
        jq(campoCPF).trigger('input').trigger('change').trigger('blur');
        U.box(st, true, 'CPF do socio inserido. Aguardando portal...');

        var tent=0;
        var intv = setInterval(function(){
          tent++;
          var nome = document.getElementById('Nome');
          var btnS = document.querySelector('.btn-salvar-gestor');
          if((nome && nome.value && nome.value.trim()!=='') || tent > 15){
            clearInterval(intv);
            if(!nome || !nome.value){ U.box(st, false, 'Portal demorou no Gestor. Marque e salve manualmente.'); callback(); return; }
            var cb = document.getElementById('isDeclaracaoIdoneoArtigo2');
            if(cb){ jq(cb).iCheck('check'); cb.checked=true; jq(cb).trigger('ifChecked').trigger('change'); }
            setTimeout(function(){
              if(btnS && !btnS._omegaClicado){
                btnS._omegaClicado = true;
                btnS.removeAttribute('disabled');
                btnS.click();
                setTimeout(function(){ if(btnS) btnS._omegaClicado=false; },3000);
              }
              setTimeout(callback, 800);
            }, 600);
          }
        }, 500);
      }, 400);
    }, 1000);
  }

  // ── Adicionar RT ────────────────────────────────────────────────
  function adicionarRT(st, callback) {
    var btn = document.querySelector('[data-action*="ResponsavelTecnico/Criar"]');
    if(!btn){ U.box(st, false, 'Botao RT nao encontrado.'); callback(); return; }
    btn.click();
    setTimeout(function(){
      var cpf = document.getElementById('Cpf');
      if(!cpf){ U.box(st, false, 'Modal do RT nao abriu.'); callback(); return; }
      cpf.value = CPF_RT;
      jq(cpf).trigger('input').trigger('change').trigger('blur');
      var tent=0;
      var intv = setInterval(function(){
        tent++;
        var nome = document.getElementById('Nome');
        var btnS = document.getElementById('btnSalvar');
        if((nome && nome.value && nome.value.trim()!=='') || tent > 15){
          clearInterval(intv);
          if(!nome || !nome.value){ callback(); return; }
          function marcarICheck(cb){ if(!cb)return; jq(cb).iCheck('check'); cb.checked=true; jq(cb).trigger('ifChecked').trigger('change'); }
          marcarICheck(document.getElementById('FoiResponsavelTecnico'));
          marcarICheck(document.getElementById('isDeclaracaoIdoneoArtigo2'));
          setTimeout(function(){
            if(btnS && !btnS._omegaClicado){
              btnS._omegaClicado = true;
              btnS.removeAttribute('disabled');
              btnS.click();
              setTimeout(function(){ if(btnS) btnS._omegaClicado=false; },3000);
            }
            setTimeout(callback, 800);
          }, 600);
        }
      }, 500);
    }, 1000);
  }

  // ── Geradores aleatorios (fallback CNPJ sem contato) ───────────
  function gerarTelefone(){
    var ddds = ['11','21','31','41','51','61','71','81','91'];
    var ddd  = ddds[Math.floor(Math.random()*ddds.length)];
    var num  = '9';
    for(var i=0;i<8;i++) num += Math.floor(Math.random()*10);
    return ddd + num;
  }

  function gerarEmail(){
    var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var email = '';
    for(var i=0;i<12;i++) email += chars[Math.floor(Math.random()*chars.length)];
    return email + '@yahoo.com';
  }

  // ── Detecta aba do portal e mostra secao correta (aba Acoes) ───
  function atualizarSecao() {
    var aba = abaAtiva();
    var isMovimentacao = tipoPedido() === 'MovimentacaoFrota';

    if(isMovimentacao){
      document.getElementById('omega-cad-contatos').style.display = 'none';
      document.getElementById('omega-cad-rt').style.display       = 'none';
      document.getElementById('omega-cad-veiculo').style.display  = 'block';
      renderHistoricoVeiculo();
      return;
    }

    document.getElementById('omega-cad-contatos').style.display = (aba==='#contatos')          ? 'block' : 'none';
    document.getElementById('omega-cad-rt').style.display       = (aba==='#responsavelTecnico') ? 'block' : 'none';
    document.getElementById('omega-cad-veiculo').style.display  = (aba==='#veiculo')            ? 'block' : 'none';
    if(aba==='#veiculo') renderHistoricoVeiculo();
  }

  document.querySelectorAll('.nav-tabs .nav-link').forEach(function(link){
    link.addEventListener('shown.bs.tab', atualizarSecao);
    link.addEventListener('click', function(){ setTimeout(atualizarSecao, 300); });
  });

  // ── CEP / Endereco (aba Acoes) ──────────────────────────────────
  function preencherEndereco(estado) {
    var st  = document.getElementById('omega-cep-status');
    var cep = cepAleatorio(estado);
    var btn = document.querySelector('[data-action*="EnderecoPedido/Novo"]');
    if(!btn) return U.box(st, false, 'Botao "Adicionar Endereco" nao encontrado.');
    U.box(st, true, 'Abrindo formulario...');
    btn.click();

    setTimeout(function(){
      var campoCep  = document.getElementById('Cep');
      var campoTipo = document.getElementById('CodigoTipoEndereco');
      if(!campoCep) return U.box(st, false, 'Modal nao abriu. Tente novamente.');
      if(campoTipo){ campoTipo.value='COR'; jq(campoTipo).trigger('change'); }

      var cepNumeros = cep.replace(/\D/g,'');
      campoCep.value = '';
      campoCep.focus();
      campoCep.dispatchEvent(new Event('focus',{bubbles:true}));

      var i=0;
      function proxCharCep(){
        if(i >= cepNumeros.length){
          campoCep.dispatchEvent(new Event('input',{bubbles:true}));
          campoCep.dispatchEvent(new Event('change',{bubbles:true}));
          campoCep.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Tab',keyCode:9}));
          campoCep.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,key:'Tab',keyCode:9}));
          campoCep.dispatchEvent(new Event('blur',{bubbles:true}));
          var campoLog = document.getElementById('Logradouro');
          if(campoLog){ campoLog.focus(); setTimeout(function(){ campoLog.blur(); },100); }
          U.box(st, true, 'CEP '+cep+' ('+estado+') inserido. Aguardando portal...');

          var tent=0;
          var intv = setInterval(function(){
            tent++;
            var l = document.getElementById('Logradouro');
            if((l && l.value && l.value.trim()!=='') || tent>=20){
              clearInterval(intv);
              setTimeout(function(){
                var l2=document.getElementById('Logradouro');
                var n2=document.getElementById('Numero');
                var b2=document.getElementById('Bairro');
                if(l2){ l2.value='0'; jq(l2).trigger('input').trigger('change'); }
                if(n2){ n2.value='0'; jq(n2).trigger('input').trigger('change'); }
                if(b2){ b2.value='0'; jq(b2).trigger('input').trigger('change'); }
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
                      U.box(st,true,'Endereco ('+estado+' / '+cep+') salvo!');
                      setTimeout(function(){ if(btnS) btnS._omegaClicado=false; },3000);
                    } else if(!btnS){ U.box(st,false,'Botao Salvar nao encontrado.'); }
                  },600);
                },500);
              },300);
            }
          },500);
          return;
        }
        var ch=cepNumeros[i];
        campoCep.value+=ch;
        campoCep.dispatchEvent(new Event('input',{bubbles:true}));
        campoCep.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,cancelable:true,key:ch}));
        i++;
        setTimeout(proxCharCep,80);
      }
      proxCharCep();
    },1200);
  }

  document.getElementById('omega-cep-mg').addEventListener('click', function(){ preencherEndereco('MG'); });
  document.getElementById('omega-cep-sp').addEventListener('click', function(){ preencherEndereco('SP'); });
  document.getElementById('omega-cep-rj').addEventListener('click', function(){ preencherEndereco('RJ'); });

  // ── Contato (aba Acoes) ─────────────────────────────────────────
  document.getElementById('omega-contato-btn').addEventListener('click', function(){
    var st   = document.getElementById('omega-contato-status');
    var tipo = tipoCadastro();
    if(tipo==='CPF'){ U.box(st,true,'CPF — contatos ja vem preenchidos pelo portal.'); return; }
    U.box(st,true,'Adicionando telefone...');
    adicionarContato('2', gerarTelefone(), function(okTel){
      if(!okTel){ U.box(st,false,'Erro ao adicionar telefone.'); return; }
      setTimeout(function(){
        var email = gerarEmail();
        adicionarContato('4', email, function(okEmail){
          if(okEmail) U.box(st,true,'Tel e email adicionados!<br><span style="font-size:10px;color:#555">'+email+'</span>');
          else U.box(st,false,'Telefone ok, erro no email.');
        });
      },1500);
    });
  });

  function adicionarContato(tipoVal, contatoVal, callback){
    var btn = document.querySelector('[data-action*="ContatoPedido/Novo"]');
    if(!btn){ callback(false); return; }
    btn.click();
    setTimeout(function(){
      var t=document.getElementById('CodigoTipoContato');
      var c=document.getElementById('Contato');
      if(!t||!c){ callback(false); return; }
      t.value=tipoVal; jq(t).trigger('change');
      setTimeout(function(){
        c.value=''; c.focus();
        c.dispatchEvent(new Event('focus',{bubbles:true}));
        var chars=contatoVal.split(''), i=0;
        function proxChar(){
          if(i>=chars.length){
            c.dispatchEvent(new Event('change',{bubbles:true}));
            c.dispatchEvent(new Event('blur',{bubbles:true}));
            setTimeout(function(){
              var s=document.querySelector('.btn-salvar-contato');
              if(s&&!s._omegaClicado){
                s._omegaClicado=true; s.click();
                setTimeout(function(){ if(s) s._omegaClicado=false; },3000);
                callback(true);
              } else if(!s) callback(false);
            },400);
            return;
          }
          var ch=chars[i];
          c.value+=ch;
          c.dispatchEvent(new Event('input',{bubbles:true}));
          c.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,cancelable:true,key:ch}));
          i++;
          setTimeout(proxChar,50);
        }
        proxChar();
      },300);
    },800);
  }

  // ── RT (aba Acoes) ──────────────────────────────────────────────
  document.getElementById('omega-rt-btn').addEventListener('click', function(){
    var st = document.getElementById('omega-rt-status');
    adicionarRT(st, function(){ U.box(st, true, 'RT adicionado! CPF: '+CPF_RT); });
  });

  // ── Historico de veiculos ───────────────────────────────────────
  var HIST_KEY = 'omega_historico';

  function carregarHistorico(){
    try{
      var raw=(typeof GM_getValue!=='undefined')?GM_getValue(HIST_KEY,'[]'):localStorage.getItem(HIST_KEY)||'[]';
      var lista=JSON.parse(raw);
      return lista.filter(function(i){ return (Date.now()-i.ts)<24*60*60*1000; });
    }catch(e){ return []; }
  }

  function renderHistoricoVeiculo(){
    var lista=carregarHistorico();
    var el=document.getElementById('omega-veiculo-hist');
    var vazio=document.getElementById('omega-veiculo-vazio');
    if(!el)return;
    if(lista.length===0){ el.innerHTML=''; if(vazio) vazio.style.display='block'; return; }
    if(vazio) vazio.style.display='none';
    el.innerHTML=lista.map(function(item,idx){
      var p=item.placa||'';
      var display=/^[A-Z]{3}[0-9]{4}$/.test(p)?p.substring(0,3)+'-'+p.substring(3):p;
      return '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f0f0f0">'
        +'<div style="font-size:12px;font-weight:bold;color:#333">'+display+'</div>'
        +'<button onclick="OmegaUsarVeiculoCad('+idx+')" style="padding:5px 10px;background:#1a73e8;color:#fff;border:none;border-radius:6px;font-size:11px;cursor:pointer">Usar</button>'
      +'</div>';
    }).join('');
  }

  // ── Monitor de popups apos verificar ───────────────────────────
  function monitorarPopupsVeiculo(st, callback){
    var tentativas=0;
    var intv=setInterval(function(){
      tentativas++;
      var bootboxSim=document.querySelector('.bootbox-confirm button[data-bb-handler="confirm"]');
      if(bootboxSim&&bootboxSim.offsetParent!==null){
        clearInterval(intv);
        U.box(st,true,'Popup detectado! Confirmando em 3s...');
        setTimeout(function(){
          bootboxSim.click();
          U.box(st,true,'Confirmado! Aguardando popup de exclusao...');
          setTimeout(function(){
            var tent2=0;
            var intv2=setInterval(function(){
              tent2++;
              var modal=document.getElementById('manterVeiculoModal');
              var titulo=modal?modal.querySelector('.modal-title'):null;
              var ehMovimentacao=titulo&&titulo.textContent.indexOf('Movimenta')!==-1;
              var visivel=modal&&(modal.style.display==='block'||modal.classList.contains('show'));
              var btnExclusao=document.querySelector('.btn-confirmar-exclusao');
              if(ehMovimentacao&&visivel&&btnExclusao){
                clearInterval(intv2);
                U.box(st,true,'Confirmando exclusao...');
                setTimeout(function(){
                  btnExclusao.click();
                  setTimeout(function(){
                    var btnInclusao=document.querySelector('.btn-confirmar-inclusao');
                    if(btnInclusao){btnInclusao.click();U.box(st,true,'Incluido na frota!');}
                    setTimeout(function(){callback();},1500);
                  },1500);
                },500);
              } else if(tent2>=15){clearInterval(intv2);callback();}
            },300);
          },1500);
        },3000);
        return;
      }
      var chassi=document.getElementById('Chassi');
      if(chassi&&chassi.value&&chassi.value.trim()!==''){clearInterval(intv);callback();return;}
      if(tentativas>=20){clearInterval(intv);callback();}
    },300);
  }

  // ── Usar veiculo do historico ───────────────────────────────────
  unsafeWindow.OmegaUsarVeiculoCad = function(idx){
    var st=document.getElementById('omega-veiculo-status');
    var lista=carregarHistorico();
    var item=lista[idx];
    if(!item) return U.box(st,false,'Item nao encontrado.');

    var _mc=document.querySelector('[data-tipo-pedido="MovimentacaoFrota"]');
    var isMovimentacao=_mc!==null;
    var modal=document.getElementById('manterVeiculoModal');
    var popupAberto=modal&&(modal.style.display==='block'||modal.classList.contains('show'));
    var tituloModal=modal?modal.querySelector('.modal-title'):null;
    var ehPopupVeiculo=tituloModal&&tituloModal.textContent.indexOf('Dados do Ve')!==-1;

    function preencher(){
      var campoPlaca=document.getElementById('Placa');
      var campoRenavam=document.getElementById('Renavam');
      var btnVerificar=document.getElementById('verificar');
      if(!campoPlaca||!campoRenavam) return U.box(st,false,'Modal do veiculo nao abriu.');
      var placaVal=(item.placa||'').replace(/[^A-Z0-9]/gi,'').toUpperCase();
      campoPlaca.removeAttribute('disabled');
      campoPlaca.value='';
      campoPlaca.focus();
      campoPlaca.dispatchEvent(new Event('focus',{bubbles:true}));
      var i=0;
      function proxChar(){
        if(i>=placaVal.length){
          campoPlaca.dispatchEvent(new Event('change',{bubbles:true}));
          campoPlaca.dispatchEvent(new Event('blur',{bubbles:true}));
          setTimeout(function(){
            campoRenavam.removeAttribute('disabled');
            campoRenavam.value=item.renavam||'';
            campoRenavam.dispatchEvent(new Event('input',{bubbles:true}));
            campoRenavam.dispatchEvent(new Event('change',{bubbles:true}));
            campoRenavam.dispatchEvent(new Event('blur',{bubbles:true}));
            setTimeout(function(){
              var placa=campoPlaca.value.toUpperCase();
              var renavam=campoRenavam.value;
              U.box(st,true,'Verificando... (pode aparecer popup)');
              jq.ajax({
                type:'GET',url:'/Veiculo/BuscarVeiculo',cache:false,
                data:{placa:placa,renavam:renavam},
                success:function(){setTimeout(function(){if(btnVerificar)btnVerificar.click();},500);},
                error:function(){setTimeout(function(){if(btnVerificar)btnVerificar.click();},500);}
              });
              monitorarPopupsVeiculo(st,function(){
                var campoTara=document.getElementById('Tara');
                if(campoTara&&(!campoTara.value||campoTara.value==='')){
                  campoTara.removeAttribute('disabled');
                  campoTara.value='2';
                  jq(campoTara).trigger('input').trigger('change');
                }
                setTimeout(function(){
                  var btnS=document.querySelector('.btn-salvar-veiculo')||document.querySelector('.btn-confirmar-inclusao');
                  if(btnS){btnS.removeAttribute('disabled');btnS.click();U.box(st,true,'Veiculo salvo! Placa: <b>'+campoPlaca.value+'</b>');}
                  else U.box(st,false,'Botao Salvar nao encontrado. Salve manualmente.');
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
        i++;
        setTimeout(proxChar,i===4?150:80);
      }
      proxChar();
    }

    if(isMovimentacao&&popupAberto&&ehPopupVeiculo){
      U.box(st,true,'Preenchendo veiculo no popup...');
      preencher();
    } else {
      var btnAdicionar=document.querySelector('[data-action*="VeiculoPedido/Novo"]');
      if(!btnAdicionar) return U.box(st,false,'Botao "Adicionar Veiculo" nao encontrado.');
      U.box(st,true,'Abrindo formulario do veiculo...');
      btnAdicionar.click();
      setTimeout(preencher,1500);
    }
  };

})();
