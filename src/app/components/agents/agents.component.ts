import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AgentService } from '../../services/agents.service';
import { Agent } from '../../models/agent.model';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router,RouterModule } from '@angular/router'; // Import Router for navigation
@Component({
  selector: 'app-agent',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule

  ],
  templateUrl: './agents.component.html',
  styleUrls: ['./agents.component.css']
})
export class AgentComponent implements OnInit {
  agentForm: FormGroup;
  addAgentMessage: string = '';
  addAgentSuccess: boolean = false;

  selectedDisplayOption: 'all' | 'specific' = 'all';
  specificAgentId: number | null = null;
  specificAgentMessage: string = '';
  agents$: Observable<Agent[]> | undefined;

  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private agentService: AgentService, private router: Router) { // Inject Router
    this.agentForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    this.getAllAgents();
  }

  /**
   * Handles the change in the display option dropdown (All Agents vs. Specific Agent).
   */
  onDisplayOptionChange(): void {
    this.specificAgentMessage = '';
    this.agents$ = of([]);
    if (this.selectedDisplayOption === 'all') {
      this.specificAgentId = null;
      this.getAllAgents();
    }
  }

  /**
   * Fetches all agents from the backend and updates the display.
   */
  getAllAgents(): void {
    this.isLoading = true;
    this.agents$ = this.agentService.getAllAgents().pipe(
      catchError(error => {
        console.error('Failed to load all agents:', error);
        this.specificAgentMessage = `Error fetching all agents: ${error.message}`;
        this.isLoading = false;
        return of([]);
      })
    );
    this.agents$.subscribe(() => {
        this.isLoading = false;
    });
  }

  /**
   * Fetches a specific agent by ID from the backend based on user input.
   */
  getSpecificAgent(): void {
    this.specificAgentMessage = '';
    this.agents$ = of([]);
    this.isLoading = true;

    if (this.specificAgentId === null || isNaN(this.specificAgentId)) {
      this.specificAgentMessage = 'Please enter a valid numeric Agent ID.';
      this.isLoading = false;
      return;
    }

    this.agentService.getAgentById(this.specificAgentId).pipe(
      catchError(error => {
        console.error(`Failed to load agent with ID ${this.specificAgentId}:`, error);
        this.specificAgentMessage = `Error fetching agent: ${error.message}`;
        this.isLoading = false;
        return of(undefined);
      })
    ).subscribe(agent => {
      if (agent) {
        this.agents$ = of([agent]);
        this.specificAgentMessage = '';
      } else {
        this.specificAgentMessage = `Agent with ID ${this.specificAgentId} not found.`;
        this.agents$ = of([]);
      }
      this.isLoading = false;
    });
  }

  /**
   * Adds a new agent to the backend via form submission.
   */
  addAgent(): void {
    this.addAgentMessage = '';
    this.addAgentSuccess = false;
    this.isLoading = true;

    if (this.agentForm.valid) {
      const newAgent: Agent = this.agentForm.value;
      this.agentService.createAgent(newAgent).subscribe({
        next: (agent) => {
          this.addAgentMessage = `Agent "${agent.name}" added successfully! ID: ${agent.id}`;
          this.addAgentSuccess = true;
          this.agentForm.reset();
          this.getAllAgents();
        },
        error: (err) => {
          this.addAgentMessage = `Error adding agent: ${err.message}`;
          this.addAgentSuccess = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.addAgentMessage = 'Please fill out the form correctly to add an agent.';
      this.addAgentSuccess = false;
      this.agentForm.markAllAsTouched();
      this.isLoading = false;
    }
  }

  /**
   * Handles the logout action, navigating to the login page.
   * In a full application, this would also clear authentication tokens/session.
   */
  logout(): void {
    // Implement actual logout logic here (e.g., clearing JWT token from localStorage)
    console.log('Logging out...');
    // For now, just navigate to the login page.
    this.router.navigate(['/login']);
  }
}
