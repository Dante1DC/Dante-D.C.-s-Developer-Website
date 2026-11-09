import { useState } from 'react';

// Define TypeScript interfaces
interface Review {
  id: string;
  rating: number;
  comment: string;
  date: string;
}

interface Machine {
  id: number;
  type: 'washer' | 'dryer';
  avgRating: number;
  reviews: Review[];
}

// Mock data (will be replaced with real data later)
const mockMachines: Machine[] = [
  {
    id: 1,
    type: 'washer',
    avgRating: 4.2,
    reviews: [
      { id: 'r1', rating: 5, comment: 'Works perfectly!', date: '2023-06-15' },
      { id: 'r2', rating: 3, comment: 'Takes longer than expected', date: '2023-06-10' },
    ],
  },
  {
    id: 2,
    type: 'dryer',
    avgRating: 3.8,
    reviews: [
      { id: 'r3', rating: 4, comment: 'Gets clothes mostly dry', date: '2023-06-12' },
      { id: 'r4', rating: 2, comment: 'Leaves clothes damp', date: '2023-06-05' },
    ],
  },
  // Add more machines as needed...
];

export default function LaundryReviewPage() {
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

  const handleSubmitReview = () => {
    // Will be implemented when we add database
    console.log('Review submitted:', newReview);
    setNewReview({ rating: 5, comment: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-4">
            Laundry Machine Reviews
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See ratings and reviews for our laundry machines. Report issues directly to housing.
          </p>
        </header>

        {selectedMachine ? (
          <MachineDetailView 
            machine={selectedMachine}
            onBack={() => setSelectedMachine(null)}
            newReview={newReview}
            onReviewChange={setNewReview}
            onSubmitReview={handleSubmitReview}
          />
        ) : (
          <MachineListView machines={mockMachines} onSelect={setSelectedMachine} />
        )}
      </div>
    </div>
  );
}

// Components
const MachineIcon = ({ type }: { type: 'washer' | 'dryer' }) => (
  <div className={`p-3 rounded-full ${type === 'washer' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
    {type === 'washer' ? (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ) : (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343M7 17v.01M17 7v.01M3 17v.01M21 7v.01M3 13a9 9 0 1118 0 9 9 0 01-18 0z" />
      </svg>
    )}
  </div>
);

const Stars = ({ rating }: { rating: number }) => (
  <div className="flex">
    {[...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-amber-400' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const MachineListView = ({ machines, onSelect }: { 
  machines: Machine[]; 
  onSelect: (machine: Machine) => void 
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {machines.map((machine) => (
      <div
        key={machine.id}
        onClick={() => onSelect(machine)}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all duration-300 ease-in-out transform hover:-translate-y-1"
      >
        <div className="flex items-center mb-4">
          <MachineIcon type={machine.type} />
          <h2 className="text-xl font-semibold text-gray-900 ml-4">
            {machine.type === 'washer' ? 'Washer' : 'Dryer'} #{machine.id}
          </h2>
        </div>
        
        <div className="flex items-center">
          <Stars rating={Math.round(machine.avgRating)} />
          <span className="ml-2 text-gray-600">
            {machine.avgRating.toFixed(1)} ({machine.reviews.length} reviews)
          </span>
        </div>
      </div>
    ))}
  </div>
);

const MachineDetailView = ({ 
  machine, 
  onBack,
  newReview,
  onReviewChange,
  onSubmitReview
}: { 
  machine: Machine;
  onBack: () => void;
  newReview: { rating: number; comment: string };
  onReviewChange: (review: { rating: number; comment: string }) => void;
  onSubmitReview: () => void;
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
    {/* Machine Header */}
    <div className="p-6 border-b border-gray-200">
      <button 
        onClick={onBack}
        className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to all machines
      </button>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <MachineIcon type={machine.type} />
          <h2 className="text-2xl font-bold text-gray-900 ml-4">
            {machine.type === 'washer' ? 'Washer' : 'Dryer'} #{machine.id}
          </h2>
        </div>
        
        <div className="flex items-center">
          <div className="flex items-center mr-6">
            <Stars rating={Math.round(machine.avgRating)} />
            <span className="ml-2 text-gray-600">
              {machine.avgRating.toFixed(1)} average
            </span>
          </div>
          
          <a
            href={`mailto:housing@example.com?subject=Repair Request for ${machine.type} #${machine.id}`}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Report Problem
          </a>
        </div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6">
      {/* Reviews Section */}
      <div className="lg:col-span-2">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h3>
        
        {machine.reviews.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {machine.reviews.map((review) => (
              <div 
                key={review.id} 
                className="bg-gray-50 rounded-xl p-6 border border-gray-200"
              >
                <div className="flex justify-between mb-2">
                  <Stars rating={review.rating} />
                  <span className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add Review Section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Add Review</h3>
        
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Rating</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => onReviewChange({ ...newReview, rating })}
                  className={`p-2 rounded-full ${
                    newReview.rating >= rating 
                      ? 'bg-amber-100 text-amber-500' 
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Comment (optional)</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => onReviewChange({ ...newReview, comment: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
              placeholder="Share your experience..."
            />
          </div>
          
          <button
            onClick={onSubmitReview}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition-colors"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  </div>
);