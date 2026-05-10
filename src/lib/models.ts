export interface SimulationPoint {
  time: number;
  value: number;
}

/**
 * Ley de Enfriamiento de Newton
 * T(t) = Tm + (T0 - Tm) * e^(-kt)
 */
export function simulateCooling(T0: number, Tm: number, k: number, duration: number, steps: number = 50): SimulationPoint[] {
  const points: SimulationPoint[] = [];
  const dt = duration / steps;
  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    const T = Tm + (T0 - Tm) * Math.exp(-k * t);
    points.push({ time: Number(t.toFixed(2)), value: Number(T.toFixed(2)) });
  }
  return points;
}

/**
 * Crecimiento Exponencial
 * P(t) = P0 * e^(kt)
 */
export function simulatePopulation(P0: number, k: number, duration: number, steps: number = 50): SimulationPoint[] {
  const points: SimulationPoint[] = [];
  const dt = duration / steps;
  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    const P = P0 * Math.exp(k * t);
    points.push({ time: Number(t.toFixed(2)), value: Number(P.toFixed(2)) });
  }
  return points;
}

/**
 * Mezclas (Tanque con volumen constante)
 * dA/dt = Rin*Cin - Rout*(A/V)
 * Solución: A(t) = Cin*V + (A0 - Cin*V) * e^(-(Rout/V)t)
 */
export function simulateMixing(A0: number, V: number, Rin: number, Cin: number, Rout: number, duration: number, steps: number = 50): SimulationPoint[] {
  const points: SimulationPoint[] = [];
  const dt = duration / steps;
  
  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    let currentA: number;
    
    if (Rin === Rout) {
      // Volumen constante
      currentA = (Cin * V) + (A0 - Cin * V) * Math.exp(-(Rout / V) * t);
    } else {
      // Volumen variable V(t) = V0 + (Rin - Rout)t
      // Usando factor integrante: dA/dt + (Rout/(V0+(Rin-Rout)t))A = Rin*Cin
      // Lo resolvemos numéricamente para evitar fórmulas complejas en el cliente
      const vt = V + (Rin - Rout) * t;
      if (vt <= 0) {
        currentA = 0;
      } else {
        // Aproximación por Euler o solución exacta si es posible
        // Por simplicidad en esta fase usamos Rin=Rout mayormente, pero aquí hacemos el cálculo por pasos si Rin != Rout
        // Para el gráfico, i=0 es A0, para i>0 integramos.
        if (i === 0) {
           currentA = A0;
        } else {
           // Usamos la fórmula analítica para V variable si es necesaria, o Euler:
           // A_next = A_curr + (Rin*Cin - Rout*(A_curr/V_curr)) * dt
           const prevA = points[i-1].value;
           const prevV = V + (Rin - Rout) * (t - dt);
           currentA = prevA + (Rin * Cin - Rout * (prevA / prevV)) * dt;
        }
      }
    }
    points.push({ time: Number(t.toFixed(2)), value: Number(currentA.toFixed(2)) });
  }
  return points;
}
