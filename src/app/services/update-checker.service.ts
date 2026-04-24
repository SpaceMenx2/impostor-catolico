import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UpdateCheckerService {
  private readonly API_URL = `https://api.github.com/repos/${environment.githubOwner}/${environment.githubRepo}/releases/latest`;
  private cachedLatestVersion: string | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL = 3600000; // 1 hora

  constructor(private http: HttpClient) {}

  getCurrentVersion(): string {
    return environment.appVersion || '0.0.0';
  }

  getLatestVersion(): Observable<string> {
    const now = Date.now();
    if (this.cachedLatestVersion && (now - this.cacheTimestamp) < this.CACHE_TTL) {
      return of(this.cachedLatestVersion);
    }

    return this.http.get<any>(this.API_URL).pipe(
      map(res => res.tag_name?.replace(/^v/, '') || ''),
      catchError(() => {
        console.warn('⚠️ No se pudo verificar actualizaciones');
        return of('');
      }),
      map(v => {
        this.cachedLatestVersion = v;
        this.cacheTimestamp = Date.now();
        return v;
      }),
      shareReplay(1)
    );
  }

  /** Parsea versiones tipo 1.2.3, v1.2.3-dev, 1.2.3-alpha.1 */
  private parseVersion(version: string) {
    const clean = version.replace(/^v/, '');
    const match = clean.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
    if (!match) return { major: 0, minor: 0, patch: 0, suffix: clean };
    
    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      suffix: match[4]
    };
  }

  /** 
   * Compara versiones siguiendo semver básico:
   * -1 → hay actualización disponible
   *  0 → misma versión
   *  1 → versión local es superior (ej: nightly > stable)
   */
  compareVersions(current: string, latest: string): number {
    if (!latest) return 0;
    
    const curr = this.parseVersion(current);
    const last = this.parseVersion(latest); // latest NUNCA tendrá suffix con /releases/latest

    // 1. Comparar MAJOR.MINOR.PATCH
    if (curr.major !== last.major) return curr.major < last.major ? -1 : 1;
    if (curr.minor !== last.minor) return curr.minor < last.minor ? -1 : 1;
    if (curr.patch !== last.patch) return curr.patch < last.patch ? -1 : 1;

    // 2. Si la base es igual, pre-release < estable
    if (curr.suffix && !last.suffix) return -1; // 1.0.0-dev < 1.0.0
    if (!curr.suffix && last.suffix) return 1;  // No debería pasar con /latest
    return 0;
  }

  isUpdateAvailable(): Observable<boolean> {
    // 🚫 SKIP en desarrollo: evita falsos positivos mientras testeás
    if (!environment.production) return of(false);
    

    return this.getLatestVersion().pipe(
      map(latest => this.compareVersions(this.getCurrentVersion(), latest) < 0)
    );
  }
}