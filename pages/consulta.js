// pages/consulta.js — modulo: Emissao de Certificado e Extrato (v57 — refatorado)
(function(){
  var U   = window.OmegaUtils;
  var jqR = unsafeWindow.jQuery || unsafeWindow.$;

  var naPaginaConsulta = !!document.getElementById('CpfCnpjTransportadorCertificado');

  U.registrarAba('emissao', 'Emissao', ''
    +'<div style="font-size:10px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px">CPF / CNPJ</div>'
    +'<div id="omega-em-sel-wrapper"><div style="font-size:11px;color:#aaa;text-align:center;padding:8px 0">Carregando...</div></div>'
    +'<div id="omega-em-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0;margin-bottom:8px"></div>'
    +'<div id="omega-em-botoes" style="display:none;grid-template-columns:1fr 1fr;gap:6px">'
      +'<button type="button" id="omega-em-cert" style="padding:9px;background:#34a853;color:#fff;border:none;border-radius:7px;font-size:12px;cursor:pointer;font-weight:bold">&#x1F4C4; Carteirinha</button>'
      +'<button type="button" id="omega-em-ext"  style="padding:9px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:12px;cursor:pointer;font-weight:bold">&#x1F4C4; Extrato</button>'
    +'</div>'
  , function(){
    if(window._omegaEmissaoErroMsg){
      var wrapper = document.getElementById('omega-em-sel-wrapper');
      if(wrapper){ wrapper.innerHTML = window._omegaEmissaoErroMsg; window._omegaEmissaoErroMsg = null; }
    } else if(_opcoesCached !== null){
      _renderDropdown(_opcoesCached);
    }
  });

  var _urlCert = null;
  var _urlExt  = null;
  var _opcoesCached = null;

  // ── Extrai opcoes de um elemento select ─────────────────────────
  function extrairOpcoes(selElement){
    if(!selElement) return [];
    return Array.from(selElement.options).filter(function(o){ return o.value !== ''; }).map(function(o){
      return { valor: o.value, texto: o.text.trim(), rntrc: o.getAttribute('data-rntrc') || '' };
    });
  }

  // ── Popula dropdown ─────────────────────────────────────────────
  function popularDropdown(opcoes){
    _opcoesCached = opcoes;
    var wrapper = document.getElementById('omega-em-sel-wrapper');
    if(!wrapper) return;
    _renderDropdown(opcoes);
  }

  function _renderDropdown(opcoes){
    var wrapper = document.getElementById('omega-em-sel-wrapper');
    if(!wrapper) return;
    if(!opcoes || opcoes.length === 0){
      wrapper.innerHTML = '<div style="font-size:11px;color:#aaa;text-align:center;padding:8px 0">Nenhum CPF/CNPJ disponivel.</div>';
      return;
    }
    var opts = '<option value="">Selecione...</option>';
    opcoes.forEach(function(o){
      var label = o.texto + (o.rntrc ? ' — RNTRC: '+o.rntrc : '');
      opts += '<option value="'+o.valor+'" data-rntrc="'+(o.rntrc||'')+'">'+label+'</option>';
    });
    wrapper.innerHTML = '<select id="omega-em-sel" style="width:100%;padding:6px;border:1px solid #ddd;border-radius:7px;font-size:11px;box-sizing:border-box;margin-bottom:8px">'+opts+'</select>';
    document.getElementById('omega-em-sel').addEventListener('change', onSelectChange);
  }

  // ── Carrega opcoes ──────────────────────────────────────────────
  if(naPaginaConsulta){
    popularDropdown(extrairOpcoes(document.getElementById('CpfCnpjTransportadorCertificado')));
  } else {
    unsafeWindow.fetch('/Transportador/Consultar')
      .then(function(r){
        if(!r.ok) throw new Error('HTTP '+r.status);
        return r.text();
      })
      .then(function(html){
        var div = document.createElement('div');
        div.innerHTML = html;
        popularDropdown(extrairOpcoes(div.querySelector('#CpfCnpjTransportadorCertificado')));
      })
      .catch(function(e){
        console.log('[OMEGA] fetch erro:', e);
        _opcoesCached = [];
        var msg = '<div style="font-size:11px;color:#c0392b;text-align:center;padding:8px 0">Erro ao carregar. <a href="/Transportador/Consultar" style="color:#1a73e8">Abrir pagina de emissao</a></div>';
        var wrapper = document.getElementById('omega-em-sel-wrapper');
        if(wrapper) wrapper.innerHTML = msg;
        else window._omegaEmissaoErroMsg = msg;
      });
  }

  // ── Ao selecionar CPF/CNPJ ──────────────────────────────────────
  function onSelectChange(){
    var st    = document.getElementById('omega-em-status');
    var valor = this.value;
    var opt   = this.options[this.selectedIndex];
    var rntrc = opt ? opt.getAttribute('data-rntrc') : '';

    document.getElementById('omega-em-botoes').style.display = 'none';
    _urlCert = null; _urlExt = null;
    U.clearBox(st);
    if(!valor) return;

    U.box(st, true, 'Consultando...');

    // Sincroniza com form da pagina (se existir)
    var selPagina = document.getElementById('CpfCnpjTransportadorCertificado');
    var hidPagina = document.getElementById('CpfCnpjTransportador');
    if(selPagina) selPagina.value = valor;
    if(hidPagina) hidPagina.value = valor;

    var token = '';
    var tokenInput = document.querySelector('input[name="__RequestVerificationToken"]');
    if(tokenInput) token = tokenInput.value;

    jqR.ajax({
      type: 'POST',
      url: '/Transportador/TransportadorDetalhado',
      data: {
        CpfCnpjTransportador: valor,
        CpfCnpjTransportadorCertificado: valor,
        __RequestVerificationToken: token
      },
      success: function(html){
        var div = document.createElement('div');
        div.innerHTML = html;

        var btnCert = div.querySelector('button[data-pdf*="CertificadoTransportador"]');
        var btnExt  = div.querySelector('button[data-pdf*="ExtratoTransportador"]');

        if(!btnCert && !btnExt){
          var msgErro = div.querySelector('.alert, .text-danger, .validation-summary-errors');
          return U.box(st, false, msgErro ? msgErro.textContent.trim() : 'Nao foi possivel emitir para este CPF/CNPJ.');
        }

        if(btnCert) _urlCert = btnCert.getAttribute('data-pdf');
        if(btnExt)  _urlExt  = btnExt.getAttribute('data-pdf');

        var sufixo = rntrc ? '_'+rntrc : '_'+valor;
        if(_urlCert) _urlCert = _urlCert.replace(/filename=[^&]+/, 'filename=Carteirinha'+sufixo+'.pdf');
        if(_urlExt)  _urlExt  = _urlExt.replace(/filename=[^&]+/,  'filename=Extrato'+sufixo+'.pdf');

        var resultadoEl = document.getElementById('ConsutarTransportador');
        if(resultadoEl) resultadoEl.innerHTML = html;

        U.box(st, true, 'Pronto! Clique para emitir.');
        var botoes = document.getElementById('omega-em-botoes');
        botoes.style.display = 'grid';
        document.getElementById('omega-em-cert').style.display = _urlCert ? 'block' : 'none';
        document.getElementById('omega-em-ext').style.display  = _urlExt  ? 'block' : 'none';
      },
      error: function(xhr){
        var msg = xhr.status === 404 ? 'CPF/CNPJ nao encontrado.' :
                  xhr.status === 500 ? 'Erro interno. Tente novamente.' :
                  'Erro ao consultar ('+xhr.status+').';
        U.box(st, false, msg);
      }
    });
  }

  // ── Emitir PDFs ─────────────────────────────────────────────────
  function abrirPDF(url){
    if(!url) return;
    unsafeWindow.open('https://rntrcdigital.antt.gov.br' + url, '_blank');
  }

  document.getElementById('omega-em-cert').addEventListener('click', function(e){
    e.preventDefault(); e.stopPropagation();
    abrirPDF(_urlCert);
  });

  document.getElementById('omega-em-ext').addEventListener('click', function(e){
    e.preventDefault(); e.stopPropagation();
    abrirPDF(_urlExt);
  });

})();
