import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReportService } from '../../services/report-service';

@Component({
  selector: 'app-admin-reports',
  imports: [DatePipe, RouterLink],
  templateUrl: './admin-reports.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './admin-reports.css'
})
export class AdminReports implements OnInit {
  reports: any[] = [];
  page: number = 1;
  pages: number = 1;
  total: number = 0;
  pageSize: number = 10;
  statusFilter: string = 'open';
  loading: boolean = true;
  loadError: string = '';
  actionError: string = '';
  message: string = '';

  statuses = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In progress' },
    { value: 'resolved', label: 'Resolved' }
  ];

  typeLabels: any = {
    missing: 'Missing',
    damaged: 'Damaged',
    wrong_info: 'Wrong information',
    other: 'Other'
  };

  constructor(private reportService: ReportService) {}

  ngOnInit() {
    this.loadReports();
  }

  loadReports() {
    this.loading = true;
    this.loadError = '';
    this.reportService.getReports(this.page, this.pageSize, this.statusFilter).subscribe({
      next: (response) => {
        this.reports = response.reports;
        this.pages = response.pages;
        this.total = response.total;
        this.loading = false;
      },
      error: (err) => {
        this.loadError = err.error?.error || 'Could not load reports.';
        this.loading = false;
      }
    });
  }

  setFilter(status: string) {
    this.statusFilter = status;
    this.page = 1;
    this.message = '';
    this.actionError = '';
    this.loadReports();
  }

  changeStatus(report: any, event: Event) {
    const select = event.target as HTMLSelectElement;
    const newStatus = select.value;
    this.message = '';
    this.actionError = '';
    this.reportService.updateStatus(report._id, newStatus).subscribe({
      next: (response) => {
        this.message = response.message;
        this.loadReports();
      },
      error: (err) => {
        this.actionError = err.error?.error || 'Could not update the report.';
        select.value = report.status;
      }
    });
  }

  previousPage() {
    if (this.page > 1) { this.page--; this.loadReports(); }
  }

  nextPage() {
    if (this.page < this.pages) { this.page++; this.loadReports(); }
  }
}
