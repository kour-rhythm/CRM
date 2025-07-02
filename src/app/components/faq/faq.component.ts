import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Needed for *ngFor and *ngIf
import { Router,RouterModule } from '@angular/router';
 
@Component({
  selector: 'app-faq',
  standalone: true, // This component is now standalone!
  imports: [CommonModule, RouterModule], // Import CommonModule for directives
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})


export class FaqComponent {

  constructor(
    private router: Router
  ){}
  // Data for the frequently asked questions.
  // This list will remain static and will not be updated by user submissions.
  faqItems = [
    {
      question: 'How do I track the status of my order?',
      answer: 'To track your order, please log in to your account and navigate to the "Order History" or "My Orders" section. You will find real-time updates on your orders status, including shipping and delivery information. You can also click on the tracking number provided to get detailed information from the carriers website.',
      isOpen: false
    },
    {
      question: 'How do I update my shipping address?',
      answer: 'You can update your shipping address in your account settings. Go to "My Account" or "Profile" and look for "Addresses" or "Shipping Information." From there, you can add a new address or edit an existing one. Please ensure you update your address before placing a new order.',
      isOpen: false
    },
    {
      question: 'Can I cancel or modify my order after it has been placed?',
      answer: 'Orders are processed quickly to ensure timely delivery. If you need to cancel or modify your order, please contact customer support immediately. We will do our best to accommodate your request, but please note that we may not be able to make changes once the order has been shipped.',
      isOpen: false
    },
    {
      question: 'How do I change the email address associated with my account?',
      answer: 'You can update your email address by logging in to your account and going to the "Account Settings" or "Profile" section. Look for the "Email" or "Contact Information" field and update it there. For security purposes, you may need to verify the change via a link sent to your old or new email address.',
      isOpen: false
    },
    {
      question: 'My payment was declined. What could be the reason?',
      answer: 'There could be several reasons for a declined payment. Please check that all card details, including the card number, expiration date, and CVV, were entered correctly. You should also ensure that the billing address you provided matches the one on file with your bank. If the problem persists, please contact your bank or credit card provider for more information.',
      isOpen: false
    },
    {
      question: 'How do I know if an item is eligible for return?',
      answer: 'Most products are eligible if returned within 30 days in unused condition. Check the product page or our returns policy for detailed eligibility criteria.',
      isOpen: false
    },
    {
      question: 'Why is my order delayed?',
      answer: 'Delays may happen due to high demand, weather conditions, or courier issues. Check your order status for the most recent updates.',
      isOpen: false
    }
  ];
 
 
   
    // This property holds the value from the input field
  
    userQuestion: string = '';
   
    toggleAnswer(item: any): void {
  
      item.isOpen = !item.isOpen;
  
    }
   
    /**
  
     * This is the method that was missing. It is called by the (input) event.
  
     * It updates the `userQuestion` property with the value from the input field.
  
     * @param event The native DOM input event.
  
     */
  
    onInput(event: Event): void {
  
      // We use a type assertion to tell TypeScript that event.target is an HTMLInputElement.
  
      this.userQuestion = (event.target as HTMLInputElement).value;
  
    }
   
    /**
  
     * This method submits the question using the value from `userQuestion`.
  
     */
  
    submitQuestion(): void {
  
      if (this.userQuestion.trim()) {
  
        console.log('User submitted a new question:', this.userQuestion);
  
        this.userQuestion = ''; // Clear the input field by resetting the property
  
        alert('Thank you for your question! We will review it shortly.');
  
      }
  
    }
    logout(): void {
      // Implement actual logout logic here (e.g., clearing JWT token from localStorage)
      console.log('Logging out...');
      // For now, just navigate to the login page.
      this.router.navigate(['/login']);
    }
  
  }
   