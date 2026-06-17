import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { APP_CONFIG } from '../../core/config/app-config';
import { SeoService } from '../../core/services/seo.service';
import { LegalPage, LegalSection } from '../../shared/components/legal-page/legal-page';

/** Política de Privacidad — base profesional (Ley 1581 de 2012, revisar con asesoría legal). */
@Component({
  selector: 'yc-privacidad',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LegalPage],
  template: `
    <yc-legal-page
      title="Política de Privacidad"
      subtitle="Cómo Yes Computo recolecta, usa y protege tus datos personales, conforme a la Ley 1581 de 2012 de Colombia."
      [updatedAt]="updatedAt"
      [sections]="sections"
    />
  `,
})
export class Privacidad implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly config = inject(APP_CONFIG);
  protected readonly updatedAt = '16 de junio de 2026';

  ngOnInit(): void {
    this.seo.update({
      title: 'Política de Privacidad',
      description:
        'Política de tratamiento de datos personales de Yes Computo, conforme a la Ley 1581 de 2012 (Habeas Data) de Colombia.',
      path: '/politica-de-privacidad',
    });
  }

  protected readonly sections: LegalSection[] = [
    {
      id: 'responsable',
      heading: 'Responsable del tratamiento',
      blocks: [
        {
          type: 'p',
          text: `${this.config.company.legalName} ("Yes Computo") es responsable del tratamiento de los datos personales recolectados a través de este sitio y de sus canales de atención. Domicilio: ${this.config.company.address.street}, ${this.config.company.address.city}, ${this.config.company.address.country}.`,
        },
        {
          type: 'p',
          text: `Contacto para asuntos de datos personales: correo ${this.config.company.email} · WhatsApp ${this.config.company.phoneDisplay}.`,
        },
      ],
    },
    {
      id: 'datos',
      heading: 'Datos que recopilamos',
      blocks: [
        { type: 'p', text: 'Podemos recolectar los siguientes datos, según tu interacción con nosotros:' },
        {
          type: 'list',
          items: [
            'Datos de identificación y contacto: nombre, empresa, correo electrónico y teléfono.',
            'Datos de la solicitud: productos de interés, mensajes y cotizaciones.',
            'Datos de navegación: información técnica del dispositivo y uso del sitio mediante cookies.',
          ],
        },
        {
          type: 'p',
          text: 'No solicitamos datos sensibles. Te pedimos no incluir información de esta naturaleza en tus mensajes.',
        },
      ],
    },
    {
      id: 'finalidades',
      heading: 'Finalidades del tratamiento',
      blocks: [
        { type: 'p', text: 'Tratamos tus datos personales para las siguientes finalidades:' },
        {
          type: 'list',
          items: [
            'Atender solicitudes, cotizaciones y preguntas.',
            'Gestionar la compra, el alquiler, la entrega y el servicio técnico de equipos.',
            'Brindar soporte, garantías y seguimiento postventa.',
            'Enviar información comercial y promociones, cuando lo hayas autorizado.',
            'Cumplir obligaciones legales, contables y tributarias.',
          ],
        },
      ],
    },
    {
      id: 'autorizacion',
      heading: 'Autorización y base legal',
      blocks: [
        {
          type: 'p',
          text: 'El tratamiento se realiza con tu autorización previa, expresa e informada, o en virtud de una relación contractual o una obligación legal, conforme a la Ley 1581 de 2012 y al Decreto 1074 de 2015. Al enviarnos tus datos, autorizas su tratamiento según esta política.',
        },
      ],
    },
    {
      id: 'derechos',
      heading: 'Tus derechos como titular',
      blocks: [
        { type: 'p', text: 'Como titular de los datos, tienes derecho a:' },
        {
          type: 'list',
          items: [
            'Conocer, actualizar y rectificar tus datos personales.',
            'Solicitar prueba de la autorización otorgada.',
            'Ser informado sobre el uso que se ha dado a tus datos.',
            'Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la ley.',
            'Revocar la autorización y/o solicitar la supresión de los datos, cuando proceda.',
            'Acceder de forma gratuita a tus datos personales.',
          ],
        },
      ],
    },
    {
      id: 'ejercer',
      heading: 'Cómo ejercer tus derechos',
      blocks: [
        {
          type: 'p',
          text: `Puedes ejercer tus derechos enviando una solicitud al correo ${this.config.company.email} o por WhatsApp al ${this.config.company.phoneDisplay}, indicando tu nombre, el derecho que deseas ejercer y la descripción de tu solicitud.`,
        },
        {
          type: 'p',
          text: 'Atenderemos consultas y reclamos en los términos y plazos establecidos por la normativa vigente.',
        },
      ],
    },
    {
      id: 'cookies',
      heading: 'Cookies y tecnologías similares',
      blocks: [
        {
          type: 'p',
          text: 'Utilizamos almacenamiento local y cookies para recordar tus preferencias (por ejemplo, el modo claro/oscuro o el contenido de tu carrito) y para mejorar tu experiencia. Puedes configurar tu navegador para bloquearlas, aunque algunas funciones podrían verse afectadas.',
        },
      ],
    },
    {
      id: 'terceros',
      heading: 'Transferencia y entrega a terceros',
      blocks: [
        {
          type: 'p',
          text: 'No vendemos tus datos personales. Podemos compartirlos con proveedores que nos prestan servicios (logística, pasarelas de pago, mensajería) y con autoridades cuando la ley lo exija, siempre bajo deberes de confidencialidad y seguridad.',
        },
      ],
    },
    {
      id: 'seguridad',
      heading: 'Seguridad de la información',
      blocks: [
        {
          type: 'p',
          text: 'Adoptamos medidas técnicas, humanas y administrativas razonables para proteger tus datos y evitar su acceso no autorizado, pérdida o alteración. Ningún sistema es completamente infalible, por lo que no podemos garantizar seguridad absoluta.',
        },
      ],
    },
    {
      id: 'conservacion',
      heading: 'Conservación de los datos',
      blocks: [
        {
          type: 'p',
          text: 'Conservamos tus datos durante el tiempo necesario para cumplir las finalidades descritas y las obligaciones legales aplicables. Una vez cumplido este plazo, los suprimimos o anonimizamos de forma segura.',
        },
      ],
    },
    {
      id: 'menores',
      heading: 'Menores de edad',
      blocks: [
        {
          type: 'p',
          text: 'Nuestros productos y servicios están dirigidos a personas mayores de edad y a empresas. No recolectamos de manera consciente datos de menores sin la autorización de sus representantes legales.',
        },
      ],
    },
    {
      id: 'cambios',
      heading: 'Cambios a esta política',
      blocks: [
        {
          type: 'p',
          text: 'Podemos actualizar esta Política de Privacidad para reflejar cambios legales u operativos. La versión vigente será la publicada en este sitio, con su fecha de actualización.',
        },
      ],
    },
  ];
}
