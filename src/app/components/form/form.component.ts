import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
export interface FoodEntry {
  FoodName: string;
  Price: number;
  Description: string;
  Quantity: number;
}
@Component({
  selector: 'app-food',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FoodComponent {
  showForm = false;
  paymentMethod = 'Card';   
  pageSize = 10;
  cardTax = 2.5;
  currentPage = 1;
  private fb = inject(FormBuilder);
  foodForm: FormGroup = this.fb.group({
    FoodName: ['', Validators.required],
    Description: ['', Validators.required],
    Price: [0, [Validators.required, Validators.min(1)]],
    Quantity: [1, [Validators.required, Validators.min(1)]],
  });
  foodList: FoodEntry[] = [];
  storageArray: any[] = [];
  editingIndex: number | null = null;
  onSubmit() {
  if (!this.foodForm.valid) {
    this.setlocalStorage
    return;
  }
  if (this.editingIndex !== null) {
    this.foodList[this.editingIndex] = this.foodForm.value;
    this.editingIndex = null;
  } else {
    this.foodList.push(this.foodForm.value);
  }
  this.foodForm.reset({
  FoodName: '',
  Description: '',
  Price: 0,
  Quantity: 1
});
this.storageArray = this.foodList.map(food => ({
  FoodName: food.FoodName,
  Description: food.Description,
  Price: food.Price,
  Quantity: food.Quantity,
  PaymentMethod: this.paymentMethod
}));
this.setlocalStorage();
this.showForm = false;
}
  paginatedFoodList(): FoodEntry[] {
  const start = (this.currentPage - 1) * this.pageSize;
  const end = start + this.pageSize;
  return this.foodList.slice(start, end);
}
getRowTotal(food: FoodEntry): number {
  return food.Price * food.Quantity;
}
//total pages
  totalPages(): number {
    return Math.ceil(
      this.foodList.length / this.pageSize
    ) ;
  }
  pages(): number[] {
    return Array.from(
      {
        length: this.totalPages()
      },
      (j, i) => i + 1
    );
  }
//chnage page
  changePage(page: number): void {
    this.currentPage = page;
  }
  //next pg
  nextPage(): void {
    if (
      this.currentPage < this.totalPages()
    ) {
      this.currentPage++;
    }
  }
//prev pg
  previousPage(): void {
    if (
      this.currentPage > 1
    ) {
      this.currentPage--;
    }
  }
//change
  changePageSize(): void {
    this.currentPage = 1;
  }
  editFood(food: FoodEntry): void {
  this.showForm = true;
  this.foodForm.patchValue(food);
  this.editingIndex = this.foodList.indexOf(food);
}
//delete food
deleteFood(food: FoodEntry): void {
  const index = this.foodList.indexOf(food);
  if (index > -1) {
    this.foodList.splice(index, 1);
  }
}
//total
getGrandTotal(): number {
   return this.foodList.reduce(
      (sum, food) => sum + this.getRowTotal(food),
      0
   );
}
increaseQuantity(food: FoodEntry): void{
  food.Quantity++;
}
decreaseQuantity(food: FoodEntry): void{
  if(food.Quantity > 1){
    food.Quantity--;
  }
}
getTax(): number {
  if (this.paymentMethod === 'Card') {
    return this.getGrandTotal() * this.cardTax / 100;
  } else {
    return this.getGrandTotal() * 0.16;
  }
}
// getTax():number{
//   if(this.paymentMethod === 'Card')
//     return this.getGrandTotal()*0.08
//   else
//     return this.getGrandTotal()*0.16
// }

getFinalTotal():number{
return this.getGrandTotal()+ this.getTax();}

downloadPDF(): void {
const doc = new jsPDF();
doc.text("Restaurant Menu", 14, 15);
autoTable(doc, {
  head: [["Food Name", "Description", "Price", "Quantity", "Total"]],
  body: this.foodList.map(food => [
    food.FoodName,
    food.Description,
   // "Rs. " + food.Price,
    food.Price,
    food.Quantity.toString(),
    this.getRowTotal(food)
  ]),
  startY: 25
});
doc.save("Restaurant_Menu.pdf");
}

//storages
setlocalStorage(): void {
  localStorage.setItem("foodData", JSON.stringify(this.storageArray));
}
getlocalStorage(): void {
  this.storageArray = JSON.parse(localStorage.getItem("foodData") || "[]");
}
}

