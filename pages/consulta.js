// pages/consulta.js — modulo: Emissao de Certificado e Extrato
(function(){
  var U   = window.OmegaUtils;
  var jqR = unsafeWindow.jQuery || unsafeWindow.$;

  U.registrarAba('emissao', 'Emissao', ''
    +'<div style="font-size:10px;font-weight:bold;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:5px">CPF / CNPJ</div>'
    +'<div style="display:flex;gap:6px;margin-bottom:8px">'
      +'<input id="omega-em-cpf" placeholder="Somente numeros" style="flex:1;padding:6px;border:1px solid #ddd;border-radius:7px;font-size:12px;box-sizing:border-box">'
      +'<button type="button" id="omega-em-btn" style="padding:6px 12px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:12px;cursor:pointer;font-weight:bold;white-space:nowrap">Consultar</button>'
    +'</div>'
    +'<div id="omega-em-status" style="font-size:11px;min-height:0;border-radius:6px;padding:0;margin-bottom:8px"></div>'
    +'<div id="omega-em-botoes" style="display:none;grid-template-columns:1fr 1fr;gap:6px">'
      +'<button type="button" id="omega-em-cert" style="padding:9px;background:#34a853;color:#fff;border:none;border-radius:7px;font-size:12px;cursor:pointer;font-weight:bold">&#x1F4C4; Carteirinha</button>'
      +'<button type="button" id="omega-em-ext"  style="padding:9px;background:#1a73e8;color:#fff;border:none;border-radius:7px;font-size:12px;cursor:pointer;font-weight:bold">&#x1F4C4; Extrato</button>'
    +'</div>'
  );

  var _urlCert = null;
  var _urlExt  = null;

  // ── Consultar via AJAX ──────────────────────────────────────────
  document.getElementById('omega-em-btn').addEventListener('click', function(e){
    e.preventDefault(); e.stopPropagation();
    var st  = document.getElementById('omega-em-status');
    var raw = document.getElementById('omega-em-cpf').value.replace(/\D/g,'');

    if(raw.length !== 11 && raw.length !== 14){
      return U.box(st, false, 'Digite um CPF (11 digitos) ou CNPJ (14 digitos).');
    }

    // Oculta botoes anteriores
    document.getElementById('omega-em-botoes').style.display = 'none';
    _urlCert = null; _urlExt = null;

    U.box(st, true, 'Consultando...');

    // Busca o token antiforgery da pagina atual
    var token = '';
    var tokenInput = document.querySelector('input[name="__RequestVerificationToken"]');
    if(tokenInput) token = tokenInput.value;

    jqR.ajax({
      type: 'POST',
      url: '/Transportador/TransportadorDetalhado',
      data: {
        CpfCnpjTransportador: raw,
        CpfCnpjTransportadorCertificado: raw,
        __RequestVerificationToken: token
      },
      success: function(html){
        // Extrai URLs dos botoes da resposta HTML
        var div = document.createElement('div');
        div.innerHTML = html;

        var btnCert = div.querySelector('button[data-pdf*="CertificadoTransportador"]');
        var btnExt  = div.querySelector('button[data-pdf*="ExtratoTransportador"]');

        if(!btnCert && !btnExt){
          // Verifica se há mensagem de erro na resposta
          var msgErro = div.querySelector('.alert, .text-danger, .validation-summary-errors');
          var textoErro = msgErro ? msgErro.textContent.trim() : 'CPF/CNPJ nao encontrado ou sem registro ativo.';
          return U.box(st, false, textoErro);
        }

        if(btnCert) _urlCert = btnCert.getAttribute('data-pdf');
        if(btnExt)  _urlExt  = btnExt.getAttribute('data-pdf');

        // Extrai nome para download
        var rntrc = '';
        var rntrcEl = div.querySelector('li p');
        // Tenta pegar RNTRC do HTML retornado
        div.querySelectorAll('li').forEach(function(li){
          var label = li.querySelector('label');
          if(label && label.textContent.trim() === 'RNTRC'){
            rntrc = li.querySelector('p') ? li.querySelector('p').textContent.trim() : '';
          }
        });

        var sufixo = rntrc ? '_'+rntrc : '_'+raw;
        _urlCert = _urlCert ? _urlCert.replace(/filename=[^&]+/, 'filename=Carteirinha'+sufixo+'.pdf') : null;
        _urlExt  = _urlExt  ? _urlExt.replace(/filename=[^&]+/,  'filename=Extrato'+sufixo+'.pdf')    : null;

        U.box(st, true, 'Encontrado! Clique para emitir.');
        var botoes = document.getElementById('omega-em-botoes');
        botoes.style.display = 'grid';

        // Mostra/oculta cada botao conforme disponibilidade
        document.getElementById('omega-em-cert').style.display = _urlCert ? 'block' : 'none';
        document.getElementById('omega-em-ext').style.display  = _urlExt  ? 'block' : 'none';
      },
      error: function(xhr){
        var msg = xhr.status === 404 ? 'CPF/CNPJ nao encontrado.' :
                  xhr.status === 500 ? 'Erro interno do servidor. Tente novamente.' :
                  'Erro ao consultar ('+xhr.status+'). Verifique o CPF/CNPJ.';
        U.box(st, false, msg);
      }
    });
  });

  // ── Emitir PDF ──────────────────────────────────────────────────
  function abrirPDF(url){
    if(!url) return;
    // Abre em nova aba — o portal serve o PDF inline ou como download
    var fullUrl = 'https://rntrcdigital.antt.gov.br' + url;
    unsafeWindow.open(fullUrl, '_blank');
  }

  document.getElementById('omega-em-cert').addEventListener('click', function(e){
    e.preventDefault(); e.stopPropagation();
    if(_urlCert) abrirPDF(_urlCert);
  });

  document.getElementById('omega-em-ext').addEventListener('click', function(e){
    e.preventDefault(); e.stopPropagation();
    if(_urlExt) abrirPDF(_urlExt);
  });

  // ── Enter no campo CPF dispara consulta ─────────────────────────
  document.getElementById('omega-em-cpf').addEventListener('keydown', function(e){
    if(e.key === 'Enter') document.getElementById('omega-em-btn').click();
  });

})();
