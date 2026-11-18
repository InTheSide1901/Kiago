import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime, distinctUntilChanged, switchMap, from, of, catchError } from 'rxjs';
import { ServiceSolicitudLocal } from '../../service/serviceSolicitudLocal/service-solicitud-local';

export interface Categoria {
  id: number;
  nombre: string;
  icono?: string;
}

/** Sugerencia que se muestra en el desplegable de direcciones */
export interface SugerenciaDireccion {
  tipo: 'direccion' | 'calle';
  calle: string;          // Nombre de la calle (ej: "Av. Corrientes")
  altura: number | null;  // Número (ej: 1234)
  detalle: string;        // Texto secundario (barrio/comuna, ciudad)
  lat: number | null;
  lon: number | null;
}

// Límites aproximados de CABA (para el respaldo con OpenStreetMap)
const CABA_BBOX = '-58.5315,-34.7054,-58.3351,-34.5265';
const CABA_CENTRO = { lat: -34.6037, lon: -58.3816 };
// ID de provincia de CABA en la API Georef
const GEOREF_PROVINCIA_CABA = '02';

@Component({
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  selector: 'app-solicitud-local',
  styleUrl: './solicitud-local.css',
  templateUrl: './solicitud-local.html',
})
export class SolicitudLocal implements OnInit, OnDestroy {
  registroForm!: FormGroup;
  imagenPreview: string | ArrayBuffer | null = null;
  archivoSeleccionado: File | null = null;

  categorias: Categoria[] = [];

  ciudades = [
    { id: 1, nombre: 'Ciudad Autónoma de Buenos Aires' }
  ];

  // --- Autocompletado de direcciones ---
  @ViewChild('inputDireccion') inputDireccion?: ElementRef<HTMLInputElement>;
  direccionTexto = '';
  sugerencias: SugerenciaDireccion[] = [];
  mostrarSugerencias = false;
  buscandoDireccion = false;
  indiceActivo = -1;
  direccionConfirmada = false;
  mensajeDireccion = '';

  private busqueda$ = new Subject<string>();
  private busquedaSub?: Subscription;
  private abortController: AbortController | null = null;

  constructor(
    private fb: FormBuilder,
    private solicitudesService: ServiceSolicitudLocal
  ) { }

  ngOnInit(): void {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required]],
      nombre_titular: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      categoria_id: ['', Validators.required],
      descripcion: ['', Validators.required],
      telefono: ['', [Validators.required]],
      correo_electronico: ['', [Validators.required, Validators.email]],
      sitio_web: [''],
      ciudad_id: ['', Validators.required],
      calle: ['', [Validators.required]],
      altura: ['', Validators.required],
      latitud: ['', Validators.required],
      longitud: ['', Validators.required]
    });

    this.cargarCategorias();

    // Búsqueda con "debounce": espera a que el usuario deje de tipear 350 ms
    this.busquedaSub = this.busqueda$
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        switchMap((texto) => {
          if (texto.trim().length < 3) {
            this.buscandoDireccion = false;
            return of<SugerenciaDireccion[]>([]);
          }
          this.buscandoDireccion = true;
          return from(this.buscarSugerencias(texto)).pipe(
            catchError((err) => {
              console.error('Error buscando direcciones:', err);
              return of<SugerenciaDireccion[]>([]);
            })
          );
        })
      )
      .subscribe((resultados) => {
        this.buscandoDireccion = false;
        this.sugerencias = resultados;
        this.indiceActivo = resultados.length ? 0 : -1;
        this.mostrarSugerencias = this.direccionTexto.trim().length >= 3;
      });
  }

  ngOnDestroy(): void {
    this.busquedaSub?.unsubscribe();
    this.abortController?.abort();
  }

  cargarCategorias(): void {
    this.solicitudesService.getCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (error) => {
        console.error('Error al cargar las categorías:', error);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // ===================== AUTOCOMPLETADO =====================

  onDireccionInput(event: Event): void {
    this.direccionTexto = (event.target as HTMLInputElement).value;

    // Si el usuario vuelve a escribir, la dirección anterior deja de ser válida
    if (this.direccionConfirmada) {
      this.direccionConfirmada = false;
      this.registroForm.patchValue({ calle: '', altura: '', latitud: '', longitud: '' });
    }
    this.mensajeDireccion = '';
    this.busqueda$.next(this.direccionTexto);
  }

  onDireccionKeydown(event: KeyboardEvent): void {
    if (!this.mostrarSugerencias || this.sugerencias.length === 0) {
      // Evita que Enter envíe el formulario mientras se escribe la dirección
      if (event.key === 'Enter') event.preventDefault();
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.indiceActivo = (this.indiceActivo + 1) % this.sugerencias.length;
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.indiceActivo = (this.indiceActivo - 1 + this.sugerencias.length) % this.sugerencias.length;
        break;
      case 'Enter':
        event.preventDefault();
        if (this.indiceActivo >= 0) this.seleccionarSugerencia(this.sugerencias[this.indiceActivo]);
        break;
      case 'Escape':
        this.mostrarSugerencias = false;
        break;
    }
  }

  onDireccionBlur(): void {
    // Pequeña demora para permitir el click en una sugerencia
    setTimeout(() => (this.mostrarSugerencias = false), 150);
  }

  onDireccionFocus(): void {
    if (this.sugerencias.length && !this.direccionConfirmada) this.mostrarSugerencias = true;
  }

  seleccionarSugerencia(s: SugerenciaDireccion): void {
    // Si sólo eligió la calle, completamos el texto y esperamos que escriba la altura
    if (s.tipo === 'calle' || s.altura === null || s.lat === null || s.lon === null) {
      this.direccionTexto = `${s.calle} `;
      if (this.inputDireccion) {
        this.inputDireccion.nativeElement.value = this.direccionTexto;
        this.inputDireccion.nativeElement.focus();
      }
      this.sugerencias = [];
      this.mostrarSugerencias = false;
      this.mensajeDireccion = 'Ahora escribí la altura (número) de la calle.';
      return;
    }

    this.direccionTexto = `${s.calle} ${s.altura}`;
    if (this.inputDireccion) this.inputDireccion.nativeElement.value = this.direccionTexto;

    this.registroForm.patchValue({
      calle: s.calle,
      altura: s.altura,
      latitud: s.lat.toFixed(7),
      longitud: s.lon.toFixed(7),
      ciudad_id: this.registroForm.value.ciudad_id || this.ciudades[0].id
    });

    this.direccionConfirmada = true;
    this.mensajeDireccion = '';
    this.sugerencias = [];
    this.mostrarSugerencias = false;
  }

  limpiarDireccion(): void {
    this.direccionTexto = '';
    if (this.inputDireccion) {
      this.inputDireccion.nativeElement.value = '';
      this.inputDireccion.nativeElement.focus();
    }
    this.direccionConfirmada = false;
    this.sugerencias = [];
    this.mensajeDireccion = '';
    this.registroForm.patchValue({ calle: '', altura: '', latitud: '', longitud: '' });
  }

  /** Busca primero en Georef (API oficial de Argentina) y si no hay resultados en OpenStreetMap */
  private async buscarSugerencias(texto: string): Promise<SugerenciaDireccion[]> {
    this.abortController?.abort();
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    const tieneNumero = /\d/.test(texto);
    let resultados: SugerenciaDireccion[] = [];

    try {
      resultados = tieneNumero
        ? await this.buscarDireccionesGeoref(texto, signal)
        : await this.buscarCallesGeoref(texto, signal);
    } catch (e: any) {
      if (e?.name === 'AbortError') throw e;
      console.warn('Georef no respondió, usando OpenStreetMap', e);
    }

    if (resultados.length === 0) {
      try {
        resultados = await this.buscarPhoton(texto, signal);
      } catch (e: any) {
        if (e?.name === 'AbortError') throw e;
        console.warn('OpenStreetMap no respondió', e);
      }
    }
    return resultados;
  }

  // Calle + altura -> coordenadas (Georef interpola la altura sobre la cuadra)
  private async buscarDireccionesGeoref(texto: string, signal: AbortSignal): Promise<SugerenciaDireccion[]> {
    const url = `https://apis.datos.gob.ar/georef/api/direcciones?direccion=${encodeURIComponent(texto)}` +
      `&provincia=${GEOREF_PROVINCIA_CABA}&max=6`;
    const resp = await fetch(url, { signal });
    if (!resp.ok) throw new Error(`Georef ${resp.status}`);
    const data = await resp.json();

    return (data?.direcciones ?? [])
      .filter((d: any) => d?.ubicacion?.lat != null && d?.ubicacion?.lon != null && d?.altura?.valor != null)
      .map((d: any) => ({
        tipo: 'direccion',
        calle: this.formatearNombre(d.calle?.nombre ?? ''),
        altura: Number(d.altura.valor),
        detalle: [d.departamento?.nombre, d.provincia?.nombre].filter(Boolean).join(', '),
        lat: Number(d.ubicacion.lat),
        lon: Number(d.ubicacion.lon)
      } as SugerenciaDireccion));
  }

  // Sólo nombre de calle (todavía sin número)
  private async buscarCallesGeoref(texto: string, signal: AbortSignal): Promise<SugerenciaDireccion[]> {
    const url = `https://apis.datos.gob.ar/georef/api/calles?nombre=${encodeURIComponent(texto)}` +
      `&provincia=${GEOREF_PROVINCIA_CABA}&max=6`;
    const resp = await fetch(url, { signal });
    if (!resp.ok) throw new Error(`Georef ${resp.status}`);
    const data = await resp.json();

    const vistos = new Set<string>();
    return (data?.calles ?? [])
      .map((c: any) => ({
        tipo: 'calle',
        calle: this.formatearNombre(c.nombre ?? ''),
        altura: null,
        detalle: [c.departamento?.nombre, c.provincia?.nombre].filter(Boolean).join(', '),
        lat: null,
        lon: null
      } as SugerenciaDireccion))
      .filter((s: SugerenciaDireccion) => {
        if (!s.calle || vistos.has(s.calle)) return false;
        vistos.add(s.calle);
        return true;
      });
  }

  // Respaldo: Photon (OpenStreetMap), pensado para autocompletar
  private async buscarPhoton(texto: string, signal: AbortSignal): Promise<SugerenciaDireccion[]> {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(texto)}&limit=6` +
      `&lat=${CABA_CENTRO.lat}&lon=${CABA_CENTRO.lon}&bbox=${CABA_BBOX}`;
    const resp = await fetch(url, { signal });
    if (!resp.ok) throw new Error(`Photon ${resp.status}`);
    const data = await resp.json();

    const numeroEscrito = texto.match(/\d+/)?.[0];

    return (data?.features ?? [])
      .map((f: any) => {
        const p = f.properties ?? {};
        const [lon, lat] = f.geometry?.coordinates ?? [];
        const calle = p.street ?? (p.osm_key === 'highway' ? p.name : null);
        if (!calle) return null;
        const alturaNum = p.housenumber ? parseInt(p.housenumber, 10) : null;
        const esDireccion = alturaNum !== null && !isNaN(alturaNum) && lat != null;
        return {
          tipo: esDireccion ? 'direccion' : 'calle',
          calle,
          altura: esDireccion ? alturaNum : null,
          detalle: [p.district ?? p.locality, p.city ?? 'Buenos Aires'].filter(Boolean).join(', '),
          lat: esDireccion ? Number(lat) : null,
          lon: esDireccion ? Number(lon) : null
        } as SugerenciaDireccion;
      })
      .filter((s: SugerenciaDireccion | null): s is SugerenciaDireccion => !!s)
      // Si el usuario escribió un número, priorizamos los resultados que lo tengan
      .sort((a: SugerenciaDireccion, b: SugerenciaDireccion) =>
        Number(String(b.altura) === numeroEscrito) - Number(String(a.altura) === numeroEscrito));
  }

  /** "AV CORRIENTES" -> "Av. Corrientes" */
  private formatearNombre(nombre: string): string {
    const minusculas = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'e']);
    const abreviaturas: Record<string, string> = { av: 'Av.', avda: 'Av.', gral: 'Gral.', dr: 'Dr.', pje: 'Pje.', pres: 'Pres.', cnel: 'Cnel.', tte: 'Tte.' };
    return nombre
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map((palabra, i) => {
        if (abreviaturas[palabra]) return abreviaturas[palabra];
        if (i > 0 && minusculas.has(palabra)) return palabra;
        return palabra.charAt(0).toUpperCase() + palabra.slice(1);
      })
      .join(' ');
  }

  // ===================== ENVÍO =====================

  onSubmit(): void {
    if (!this.registroForm.value.latitud || !this.registroForm.value.longitud) {
      alert('Por favor, buscá y seleccioná la dirección del local de la lista de sugerencias.');
      this.registroForm.markAllAsTouched();
      return;
    }

    if (this.registroForm.invalid) {
      alert('Por favor, completá todos los campos obligatorios antes de enviar.');
      this.registroForm.markAllAsTouched();
      return;
    }

    if (!this.archivoSeleccionado) {
      alert('Por favor, seleccioná una foto principal para el local.');
      return;
    }

    // FormData para enviar archivo y texto juntos (mismos campos que antes)
    const formData = new FormData();
    const formValues = this.registroForm.value;

    Object.keys(formValues).forEach(key => {
      if (formValues[key] !== null && formValues[key] !== '') {
        formData.append(key, formValues[key]);
      }
    });

    // Archivo con el nombre 'imagen' (el que busca multer)
    formData.append('imagen', this.archivoSeleccionado);

    this.solicitudesService.enviarSolicitud(formData).subscribe({
      next: () => {
        alert('¡Solicitud enviada con éxito! Está en estado pendiente de aprobación.');
        this.registroForm.reset({ categoria_id: '', ciudad_id: '' });
        this.imagenPreview = null;
        this.archivoSeleccionado = null;
        this.limpiarDireccion();
      },
      error: (error) => {
        console.error('Error del servidor:', error);
        alert('Hubo un error al enviar la solicitud. Revisá la consola.');
      }
    });
  }
}
