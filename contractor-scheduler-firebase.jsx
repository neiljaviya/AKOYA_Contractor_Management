import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Building2, User, Plus, ChevronLeft, ChevronRight, X, Wifi, WifiOff } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';

// Firebase configuration - REPLACE WITH YOUR CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyCyF9zUCTlh7kzm1Su4k54pCzypnpgpF68",
  authDomain: "akoya-contractor-management.firebaseapp.com",
  projectId: "akoya-contractor-management",
  storageBucket: "akoya-contractor-management.firebasestorage.app",
  messagingSenderId: "283896618807",
  appId: "1:283896618807:web:031e901b9a6ec334cf04b2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ContractorScheduler = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [calendarView, setCalendarView] = useState('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    contractorName: '',
    locationType: 'unit',
    unitNumbers: '',
    date: new Date().toISOString().split('T')[0],
    fromTime: '09:00',
    toTime: '17:00',
    notes: ''
  });

  // Real-time listener for schedules
  useEffect(() => {
    const q = query(collection(db, 'schedules'), orderBy('date', 'asc'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const schedulesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSchedules(schedulesData);
        setIsLoading(false);
        setIsOnline(true);
      },
      (error) => {
        console.error('Error fetching schedules:', error);
        setIsOnline(false);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await addDoc(collection(db, 'schedules'), {
        ...formData,
        createdAt: new Date().toISOString()
      });
      
      setFormData({
        contractorName: '',
        locationType: 'unit',
        unitNumbers: '',
        date: new Date().toISOString().split('T')[0],
        fromTime: '09:00',
        toTime: '17:00',
        notes: ''
      });
      
      // Show success message
      alert('Schedule added successfully!');
    } catch (error) {
      console.error('Error adding schedule:', error);
      alert('Error adding schedule. Please try again.');
    }
  };

  const deleteSchedule = async (id) => {
    if (window.confirm('Are you sure you want to delete this schedule?')) {
      try {
        await deleteDoc(doc(db, 'schedules', id));
      } catch (error) {
        console.error('Error deleting schedule:', error);
        alert('Error deleting schedule. Please try again.');
      }
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getWeekDays = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day;
    const sunday = new Date(date.setDate(diff));
    
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      return d;
    });
  };

  const getSchedulesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.filter(s => s.date === dateStr);
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid #e2e8f0',
            borderTopColor: '#667eea',
            borderRadius: '50%',
            margin: '0 auto 1rem',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '1.1rem' }}>Loading schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '2rem'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '20px',
          padding: '2rem 2.5rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          backdropFilter: 'blur(10px)',
          position: 'relative'
        }}>
          {/* Online Status Indicator */}
          <div style={{
            position: 'absolute',
            top: '2rem',
            right: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            background: isOnline ? '#dcfce7' : '#fee2e2',
            color: isOnline ? '#16a34a' : '#dc2626',
            fontSize: '0.85rem',
            fontWeight: '600'
          }}>
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            {isOnline ? 'Connected' : 'Offline'}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '0.5rem'
          }}>
            <Calendar size={32} style={{ color: '#667eea' }} />
            <h1 style={{
              margin: 0,
              fontSize: '2rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Contractor Schedule Manager
            </h1>
          </div>
          <p style={{
            margin: 0,
            color: '#64748b',
            fontSize: '0.95rem'
          }}>
            Akoya Living - 55 Broadway Avenue
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '0.5rem',
          display: 'inline-flex',
          gap: '0.5rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        }}>
          <button
            onClick={() => setActiveTab('schedule')}
            style={{
              padding: '0.75rem 2rem',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: activeTab === 'schedule' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'transparent',
              color: activeTab === 'schedule' ? 'white' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Plus size={18} />
            Schedule Contractor
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            style={{
              padding: '0.75rem 2rem',
              border: 'none',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              background: activeTab === 'calendar'
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'transparent',
              color: activeTab === 'calendar' ? 'white' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Calendar size={18} />
            View Calendar
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {activeTab === 'schedule' ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.98)',
            borderRadius: '20px',
            padding: '2.5rem',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
          }}>
            <h2 style={{
              marginTop: 0,
              marginBottom: '2rem',
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#1e293b'
            }}>
              Add New Schedule
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {/* Contractor Name */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#475569'
                  }}>
                    <User size={16} />
                    Contractor Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contractorName}
                    onChange={(e) => setFormData({ ...formData, contractorName: e.target.value })}
                    placeholder="Enter contractor name"
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>

                {/* Location Type */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#475569'
                  }}>
                    <Building2 size={16} />
                    Location Type
                  </label>
                  <select
                    value={formData.locationType}
                    onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease',
                      outline: 'none',
                      cursor: 'pointer',
                      background: 'white'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  >
                    <option value="unit">Specific Unit(s)</option>
                    <option value="building">Entire Building</option>
                  </select>
                </div>

                {/* Unit Numbers */}
                {formData.locationType === 'unit' && (
                  <div>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      color: '#475569'
                    }}>
                      <Building2 size={16} />
                      Unit Number(s)
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.unitNumbers}
                      onChange={(e) => setFormData({ ...formData, unitNumbers: e.target.value })}
                      placeholder="e.g., 1804 or 201, 301, 401"
                      style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '0.95rem',
                        transition: 'all 0.3s ease',
                        outline: 'none'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </div>
                )}

                {/* Date */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#475569'
                  }}>
                    <Calendar size={16} />
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>

                {/* From Time */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#475569'
                  }}>
                    <Clock size={16} />
                    From Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.fromTime}
                    onChange={(e) => setFormData({ ...formData, fromTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>

                {/* To Time */}
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#475569'
                  }}>
                    <Clock size={16} />
                    To Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.toTime}
                    onChange={(e) => setFormData({ ...formData, toTime: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      border: '2px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '0.95rem',
                      transition: 'all 0.3s ease',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                  />
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#475569'
                }}>
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special instructions or notes..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isOnline}
                style={{
                  padding: '1rem 2.5rem',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isOnline ? 'pointer' : 'not-allowed',
                  background: isOnline 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : '#94a3b8',
                  color: 'white',
                  boxShadow: isOnline ? '0 10px 30px rgba(102, 126, 234, 0.4)' : 'none',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  opacity: isOnline ? 1 : 0.6
                }}
                onMouseEnter={(e) => {
                  if (isOnline) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isOnline) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.4)';
                  }
                }}
              >
                <Plus size={20} />
                {isOnline ? 'Add Schedule' : 'Offline - Cannot Add'}
              </button>
            </form>
          </div>
        ) : (
          <div>
            {/* Calendar View Selector */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '16px',
              padding: '1rem',
              marginBottom: '1.5rem',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                background: '#f8fafc',
                padding: '0.25rem',
                borderRadius: '10px'
              }}>
                {['daily', 'weekly', 'monthly'].map(view => (
                  <button
                    key={view}
                    onClick={() => setCalendarView(view)}
                    style={{
                      padding: '0.625rem 1.25rem',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      background: calendarView === view 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'transparent',
                      color: calendarView === view ? 'white' : '#64748b',
                      textTransform: 'capitalize'
                    }}
                  >
                    {view}
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    if (calendarView === 'daily') {
                      newDate.setDate(newDate.getDate() - 1);
                    } else if (calendarView === 'weekly') {
                      newDate.setDate(newDate.getDate() - 7);
                    } else {
                      newDate.setMonth(newDate.getMonth() - 1);
                    }
                    setCurrentDate(newDate);
                  }}
                  style={{
                    padding: '0.5rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#e2e8f0'}
                  onMouseLeave={(e) => e.target.style.background = '#f8fafc'}
                >
                  <ChevronLeft size={20} color="#475569" />
                </button>

                <div style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  minWidth: '180px',
                  textAlign: 'center'
                }}>
                  {calendarView === 'monthly' 
                    ? currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : calendarView === 'weekly'
                    ? `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
                    : currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
                  }
                </div>

                <button
                  onClick={() => {
                    const newDate = new Date(currentDate);
                    if (calendarView === 'daily') {
                      newDate.setDate(newDate.getDate() + 1);
                    } else if (calendarView === 'weekly') {
                      newDate.setDate(newDate.getDate() + 7);
                    } else {
                      newDate.setMonth(newDate.getMonth() + 1);
                    }
                    setCurrentDate(newDate);
                  }}
                  style={{
                    padding: '0.5rem',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#f8fafc',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#e2e8f0'}
                  onMouseLeave={(e) => e.target.style.background = '#f8fafc'}
                >
                  <ChevronRight size={20} color="#475569" />
                </button>

                <button
                  onClick={() => setCurrentDate(new Date())}
                  style={{
                    padding: '0.625rem 1.25rem',
                    border: '2px solid #667eea',
                    borderRadius: '8px',
                    background: 'white',
                    color: '#667eea',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#667eea';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.color = '#667eea';
                  }}
                >
                  Today
                </button>
              </div>
            </div>

            {/* Calendar Content */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.98)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              minHeight: '600px'
            }}>
              {calendarView === 'daily' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {getSchedulesForDate(currentDate).length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '4rem 2rem',
                      color: '#94a3b8',
                      fontSize: '1.1rem'
                    }}>
                      <Calendar size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                      <p style={{ margin: 0 }}>No contractors scheduled for this day</p>
                    </div>
                  ) : (
                    getSchedulesForDate(currentDate).map(schedule => (
                      <div
                        key={schedule.id}
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '16px',
                          padding: '1.5rem',
                          color: 'white',
                          position: 'relative',
                          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
                          animation: 'slideIn 0.3s ease'
                        }}
                      >
                        <button
                          onClick={() => deleteSchedule(schedule.id)}
                          disabled={!isOnline}
                          style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'rgba(255, 255, 255, 0.2)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '0.5rem',
                            cursor: isOnline ? 'pointer' : 'not-allowed',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            opacity: isOnline ? 1 : 0.5
                          }}
                          onMouseEnter={(e) => {
                            if (isOnline) e.target.style.background = 'rgba(255, 255, 255, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            if (isOnline) e.target.style.background = 'rgba(255, 255, 255, 0.2)';
                          }}
                        >
                          <X size={16} color="white" />
                        </button>
                        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>
                          {schedule.contractorName}
                        </h3>
                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                          <div>
                            <div style={{ opacity: 0.8, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                              Time
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: '600' }}>
                              {formatTime(schedule.fromTime)} - {formatTime(schedule.toTime)}
                            </div>
                          </div>
                          <div>
                            <div style={{ opacity: 0.8, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                              Location
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: '600' }}>
                              {schedule.locationType === 'building' ? 'Entire Building' : `Unit ${schedule.unitNumbers}`}
                            </div>
                          </div>
                        </div>
                        {schedule.notes && (
                          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
                            <div style={{ opacity: 0.8, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                              Notes
                            </div>
                            <div style={{ fontSize: '0.95rem' }}>
                              {schedule.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {calendarView === 'weekly' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem' }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} style={{
                      textAlign: 'center',
                      fontWeight: '700',
                      color: '#64748b',
                      fontSize: '0.85rem',
                      marginBottom: '0.5rem'
                    }}>
                      {day}
                    </div>
                  ))}
                  {getWeekDays(currentDate).map((date, idx) => {
                    const daySchedules = getSchedulesForDate(date);
                    const isToday = date.toDateString() === new Date().toDateString();
                    return (
                      <div
                        key={idx}
                        style={{
                          background: isToday ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8fafc',
                          borderRadius: '12px',
                          padding: '1rem',
                          minHeight: '120px',
                          color: isToday ? 'white' : '#1e293b',
                          position: 'relative'
                        }}
                      >
                        <div style={{
                          fontWeight: '700',
                          marginBottom: '0.75rem',
                          fontSize: '1.1rem'
                        }}>
                          {date.getDate()}
                        </div>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem'
                        }}>
                          {daySchedules.slice(0, 2).map(schedule => (
                            <div
                              key={schedule.id}
                              style={{
                                background: isToday ? 'rgba(255, 255, 255, 0.2)' : 'white',
                                padding: '0.5rem',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                border: isToday ? 'none' : '2px solid #e2e8f0'
                              }}
                            >
                              {schedule.contractorName}
                            </div>
                          ))}
                          {daySchedules.length > 2 && (
                            <div style={{
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              opacity: 0.7
                            }}>
                              +{daySchedules.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {calendarView === 'monthly' && (
                <div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} style={{
                        textAlign: 'center',
                        fontWeight: '700',
                        color: '#64748b',
                        fontSize: '0.85rem',
                        padding: '0.5rem'
                      }}>
                        {day}
                      </div>
                    ))}
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '0.5rem'
                  }}>
                    {(() => {
                      const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
                      const days = [];
                      
                      // Empty cells for days before month starts
                      for (let i = 0; i < startingDayOfWeek; i++) {
                        days.push(<div key={`empty-${i}`} />);
                      }
                      
                      // Days of the month
                      for (let day = 1; day <= daysInMonth; day++) {
                        const date = new Date(year, month, day);
                        const daySchedules = getSchedulesForDate(date);
                        const isToday = date.toDateString() === new Date().toDateString();
                        
                        days.push(
                          <div
                            key={day}
                            style={{
                              background: isToday ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8fafc',
                              borderRadius: '12px',
                              padding: '0.75rem',
                              minHeight: '80px',
                              color: isToday ? 'white' : '#1e293b',
                              cursor: daySchedules.length > 0 ? 'pointer' : 'default',
                              transition: 'all 0.3s ease'
                            }}
                            onClick={() => {
                              if (daySchedules.length > 0) {
                                setCurrentDate(date);
                                setCalendarView('daily');
                              }
                            }}
                            onMouseEnter={(e) => {
                              if (daySchedules.length > 0 && !isToday) {
                                e.currentTarget.style.background = '#e2e8f0';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (daySchedules.length > 0 && !isToday) {
                                e.currentTarget.style.background = '#f8fafc';
                              }
                            }}
                          >
                            <div style={{
                              fontWeight: '700',
                              marginBottom: '0.5rem'
                            }}>
                              {day}
                            </div>
                            {daySchedules.length > 0 && (
                              <div style={{
                                background: isToday ? 'rgba(255, 255, 255, 0.3)' : '#667eea',
                                color: isToday ? 'white' : 'white',
                                borderRadius: '6px',
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                textAlign: 'center'
                              }}>
                                {daySchedules.length} {daySchedules.length === 1 ? 'schedule' : 'schedules'}
                              </div>
                            )}
                          </div>
                        );
                      }
                      
                      return days;
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        
        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

export default ContractorScheduler;
