import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { APP_CONFIG } from '../../core/config/app-config';
import { SeoService } from '../../core/services/seo.service';
import { LegalPage, LegalSection } from '../../shared/components/legal-page/legal-page';

/** Términos y Condiciones — base profesional adaptable (revisar con asesoría legal). */
@Component({
  selector: 'yc-terminos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LegalPage],
  template: `
    <yc-legal-page
      title="Términos y Condiciones"
      subtitle="Condiciones que rigen el uso de este sitio y la compra de productos y servicios de Yes Computo."
      [updatedAt]="updatedAt"
      [sections]="sections"
    />
  `,
})
export class Terminos implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly config = inject(APP_CONFIG);
  protected readonly updatedAt = '16 de junio de 2026';

  ngOnInit(): void {
    this.seo.update({
      title: 'Términos y Condiciones',
      description:
        'Términos y condiciones de uso del sitio y de compra de productos y servicios de Yes Computo en Cartagena, Colombia.',
      path: '/terminos-y-condiciones',
    });
  }

  protected readonly sections: LegalSection[] = [
    {
      id: 'identificacion',
      heading: 'Identificación del titular',
      blocks: [
        {
          type: 'p',
          text: `Este sitio web es operado por ${this.config.company.legalName} ("Yes Computo", "nosotros"), con domicilio en ${this.config.company.address.street}, ${this.config.company.address.neighborhood}, ${this.config.company.address.city}, ${this.config.company.address.country}.`,
        },
        {
          type: 'p',
          text: `Para cualquier asunto relacionado con estos términos puedes contactarnos al WhatsApp ${this.config.company.phoneDisplay} o al correo ${this.config.company.email}.`,
        },
      ],
    },
    {
      id: 'aceptacion',
      heading: 'Objeto y aceptación',
      blocks: [
        {
          type: 'p',
          text: 'Estos Términos y Condiciones regulan el acceso y uso del sitio, así como la adquisición de productos y servicios ofrecidos por Yes Computo. Al navegar, solicitar una cotización o realizar una compra, aceptas estos términos en su totalidad.',
        },
        {
          type: 'p',
          text: 'Si no estás de acuerdo con alguna de las condiciones aquí descritas, te pedimos abstenerte de utilizar el sitio o de adquirir nuestros productos y servicios.',
        },
      ],
    },
    {
      id: 'productos',
      heading: 'Productos y servicios',
      blocks: [
        {
          type: 'p',
          text: 'Comercializamos equipos de cómputo nuevos y reacondicionados (tecnología circular), accesorios, periféricos y soluciones tecnológicas, además de servicios de alquiler de equipos y servicio técnico especializado.',
        },
        {
          type: 'p',
          text: 'Las imágenes, descripciones y especificaciones publicadas son de carácter referencial. Pueden existir variaciones según el lote, la disponibilidad o el fabricante. Confirmamos las características exactas de cada equipo antes de la entrega.',
        },
      ],
    },
    {
      id: 'precios',
      heading: 'Precios, disponibilidad y cotización',
      blocks: [
        {
          type: 'p',
          text: 'Los precios se expresan en pesos colombianos (COP) e incluyen IVA, salvo que se indique lo contrario. Los valores y la disponibilidad pueden cambiar sin previo aviso y están sujetos a confirmación de inventario.',
        },
        {
          type: 'p',
          text: 'El sitio funciona como catálogo y canal de cotización: el carrito permite armar una lista de equipos y solicitar una cotización formal, principalmente a través de WhatsApp. La compra se perfecciona una vez confirmados el precio, la disponibilidad y la forma de pago con un asesor.',
        },
      ],
    },
    {
      id: 'pagos',
      heading: 'Formas de pago',
      blocks: [
        {
          type: 'p',
          text: 'Aceptamos los medios de pago informados por el asesor al momento de la cotización (por ejemplo, transferencia, consignación, datáfono o pasarela de pago habilitada). El pedido se procesa una vez verificado el pago correspondiente.',
        },
      ],
    },
    {
      id: 'entregas',
      heading: 'Envíos y entregas',
      blocks: [
        {
          type: 'p',
          text: 'Realizamos entregas en Cartagena y despachos a otras ciudades según se acuerde con el cliente. Los tiempos y costos de envío se informan durante la cotización y dependen del destino y del producto.',
        },
        {
          type: 'p',
          text: 'El riesgo sobre los bienes se transfiere al cliente en el momento de la entrega. Te recomendamos revisar el equipo al recibirlo.',
        },
      ],
    },
    {
      id: 'garantias',
      heading: 'Garantías',
      blocks: [
        {
          type: 'p',
          text: 'Todos nuestros equipos cuentan con garantía. La cobertura y duración dependen del producto y de su condición (nuevo o reacondicionado), y se informan en la cotización y en la factura.',
        },
        {
          type: 'list',
          items: [
            'La garantía cubre defectos de funcionamiento bajo condiciones normales de uso.',
            'No cubre daños por mal uso, manipulación por terceros no autorizados, golpes, líquidos, sobretensiones eléctricas ni software ajeno al entregado.',
            'Para hacerla efectiva, conserva la factura y comunícate con nuestro servicio técnico.',
          ],
        },
      ],
    },
    {
      id: 'reacondicionados',
      heading: 'Equipos reacondicionados (tecnología circular)',
      blocks: [
        {
          type: 'p',
          text: 'Los equipos reacondicionados son productos corporativos previamente utilizados que han sido revisados, probados y optimizados por nuestros técnicos para garantizar su correcto funcionamiento.',
        },
        {
          type: 'p',
          text: 'Por su naturaleza, pueden presentar signos estéticos de uso que no afectan su rendimiento. Cada equipo se entrega con la garantía indicada en su ficha y en la factura.',
        },
      ],
    },
    {
      id: 'retracto',
      heading: 'Derecho de retracto y reversión del pago',
      blocks: [
        {
          type: 'p',
          text: 'En las compras realizadas a distancia, el consumidor podrá ejercer el derecho de retracto dentro de los cinco (5) días hábiles siguientes a la entrega del bien, conforme a la Ley 1480 de 2011 (Estatuto del Consumidor) de Colombia, siempre que el producto se devuelva en las mismas condiciones en que se recibió.',
        },
        {
          type: 'p',
          text: 'Aplican las excepciones previstas en la ley. Los costos de transporte y demás que conlleve la devolución se regirán por la normativa vigente. Para iniciar el proceso, contáctanos por nuestros canales oficiales.',
        },
      ],
    },
    {
      id: 'alquiler',
      heading: 'Alquiler de equipos',
      blocks: [
        {
          type: 'p',
          text: 'El servicio de alquiler de equipos se rige por un contrato o acuerdo específico que define plazo, condiciones de uso, mantenimiento, garantías y responsabilidades de las partes. Los valores mensuales publicados son referenciales.',
        },
      ],
    },
    {
      id: 'propiedad',
      heading: 'Propiedad intelectual',
      blocks: [
        {
          type: 'p',
          text: 'La marca, el logotipo, los textos, el diseño y demás contenidos de este sitio son propiedad de Yes Computo o de sus respectivos titulares y están protegidos por la legislación aplicable. Queda prohibida su reproducción sin autorización previa y escrita.',
        },
      ],
    },
    {
      id: 'responsabilidad',
      heading: 'Limitación de responsabilidad',
      blocks: [
        {
          type: 'p',
          text: 'Hacemos nuestro mejor esfuerzo para que la información del sitio sea correcta y esté actualizada; sin embargo, no garantizamos que esté libre de errores u omisiones. Yes Computo no será responsable por daños derivados del uso del sitio o de la imposibilidad de acceder a él.',
        },
      ],
    },
    {
      id: 'datos',
      heading: 'Protección de datos personales',
      blocks: [
        {
          type: 'p',
          text: 'El tratamiento de los datos personales que nos suministres se rige por nuestra Política de Privacidad, disponible en este sitio, conforme a la Ley 1581 de 2012 y demás normas aplicables en Colombia.',
        },
      ],
    },
    {
      id: 'ley',
      heading: 'Ley aplicable y jurisdicción',
      blocks: [
        {
          type: 'p',
          text: `Estos Términos y Condiciones se rigen por las leyes de la República de Colombia. Cualquier controversia se someterá a los jueces y tribunales competentes de ${this.config.company.address.city}.`,
        },
      ],
    },
    {
      id: 'modificaciones',
      heading: 'Modificaciones',
      blocks: [
        {
          type: 'p',
          text: 'Podemos actualizar estos términos en cualquier momento. La versión vigente será siempre la publicada en este sitio, con su respectiva fecha de actualización.',
        },
      ],
    },
  ];
}
