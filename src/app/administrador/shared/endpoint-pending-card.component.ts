import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-endpoint-pending-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center" role="status">
      <div class="w-12 h-12 mx-auto bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center mb-4 text-xl">
        🚧
      </div>
      <h2 class="text-lg font-bold text-slate-900 mb-1">{{ titulo() }}</h2>
      <p class="text-slate-500 text-sm max-w-lg mx-auto">{{ mensaje() }}</p>
    </div>
  `,
})
export class EndpointPendingCardComponent {
  readonly titulo = input('Endpoint pendiente');
  readonly mensaje = input.required<string>();
}
