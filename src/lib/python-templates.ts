export const coolingPython = (T0: number, Tm: number, k: number, duration: number) => `
import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import odeint

# --- MÓDULO 1: ENFRIAMIENTO DE CPU ---
# Analogía: Enfriamiento de un procesador tras carga de renderizado intensa

T0 = ${T0}     # Temp. inicial CPU (°F)
T_amb = ${Tm}  # Temp. ambiente Data Center (°F)
k = ${k}      # Constante de enfriamiento (min⁻¹)
t_fin = ${duration} 

# Modelo numérico (odeint)
def modelo(T, t):
    return k * (T - T_amb)

t = np.linspace(0, t_fin, 500)
T_num = odeint(modelo, T0, t).flatten()

# Graficar
plt.style.use('dark_background')
plt.figure(figsize=(10, 5))
plt.plot(t, T_num, color='#7ee8fa', label="Simulación: Temperatura CPU")
plt.axhline(T_amb, color='#888aaa', linestyle=':', label="Temperatura Ambiente")
plt.title("Gestión Térmica: Ley de Enfriamiento de Newton")
plt.xlabel("Tiempo (min)")
plt.ylabel("Temperatura (°F)")
plt.grid(alpha=0.2)
plt.legend()
plt.show()
`;

export const populationPython = (P0: number, k: number, duration: number) => `
import numpy as np
import matplotlib.pyplot as plt

# --- MÓDULO 2: TRÁFICO DE RED ---
# Analogía: Escalamiento exponencial de paquetes en un nodo

P0 = ${P0}       # Tráfico inicial (paquetes/s)
k = ${k}        # Tasa de crecimiento (h⁻¹)
t_fin = ${duration}

def solve_traffic(t):
    return P0 * np.exp(k * t)

t = np.linspace(0, t_fin, 500)
P = solve_traffic(t)

# Graficar
plt.style.use('dark_background')
plt.figure(figsize=(10, 5))
plt.plot(t, P, color='#a8edea', label="Paquetes procesados")
plt.fill_between(t, P, alpha=0.1, color='#a8edea')
plt.title("Escalamiento de Tráfico en Nodo de Red")
plt.xlabel("Tiempo (h)")
plt.ylabel("Paquetes / segundo")
plt.grid(alpha=0.1)
plt.legend()
plt.show()
`;

export const mixingPython = (A0: number, V: number, Rin: number, Cin: number, Rout: number, duration: number) => `
import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import odeint

# --- MÓDULO 3: DINÁMICA DE BUFFER ---
# Analogía: Acumulación de redundancia en memoria buffer

A0 = ${A0}       # Datos iniciales (MB)
V0 = ${V}       # Capacidad total buffer (MB)
c_ent = ${Cin}  # Concentración entrada (unids/MB)
f_ent = ${Rin}  # Flujo entrada (MB/s)
f_sal = ${Rout}  # Flujo salida (MB/s)
t_fin = ${duration}

def modelo(A, t_val):
    V = V0 + (f_ent - f_sal) * t_val
    V_safe = max(V, 1e-6)
    return c_ent * f_ent - (f_sal / V_safe) * A

t = np.linspace(0, t_fin, 800)
A_num = odeint(modelo, A0, t).flatten()

# Graficar
plt.style.use('dark_background')
plt.figure(figsize=(10, 5))
plt.plot(t, A_num, color='#fccb90', label="Datos en Buffer")
plt.axhline(V0, color='#ff6b9d', linestyle=':', label="Capacidad Max")
plt.title("Dinámica de Flujo en Buffer de Red")
plt.xlabel("Tiempo (s)")
plt.ylabel("Unidades (MB)")
plt.legend()
plt.grid(alpha=0.1)
plt.show()
`;
