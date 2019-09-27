export interface Element {
    id: number;
    name: string;
    parentId?: number;
    parent?: Element;
    children?: Element[];
    synonyms?: Synonym[];
}

export interface Facility extends Element {
}

export interface Idn extends Element {
}

export interface Idn extends Element {
}

export interface KeyType {
    id: number;
    name: string;
    providers?: Provider[];
}

export interface Provider {
    id: number;
    name: string;
    keyTypeId: number;
    keyType: KeyType;
}

export interface Root extends Element {
}

export interface Synonym {
    id: number;
    name: string;
    providerId: number;
    provider: Provider;
    elementId: number;
    element: Element;
    key: string;
}

export interface Unit extends Element {
}
