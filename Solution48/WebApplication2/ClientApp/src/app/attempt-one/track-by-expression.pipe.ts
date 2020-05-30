import { Pipe } from "@angular/core";
import { PipeTransform } from "@angular/core";

interface TrackByExpressionCache {
  [propertyName: string]: <T>(index: number, item: T) => any;
}

var cache: TrackByExpressionCache = Object.create(null);

@Pipe({
  name: "trackByExpression",
  pure: true
})
export class TrackByExpressionPipe implements PipeTransform {
  public transform(propertyName: string): Function {
    console.warn(`Getting track-by for [${propertyName}].`);
    if (!cache[propertyName]) {
      if (propertyName === "$index") {
        cache[propertyName] = function trackByProperty<T>(index: number, item: T): any {
          return index;
        };
      }
      else if (propertyName === "$value") {
        cache[propertyName] = function trackByProperty<T>(index: number, item: T): any {
          return item;
        };
      }
      else {
        cache[propertyName] = function trackByProperty<T>(index: number, item: T): any {
          return (item[propertyName]);
        };
      }
    }
    return (cache[propertyName]);
  }
}
