export interface Product {
    name: string;
    photoUrl: string;
    description: string;
    price: number;
    createdBy: string;
    categoryId: string;
    checkIn: string;
    checkOut?: Date;
}
